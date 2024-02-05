import {Element} from 'src/app/classes/diagram/element';
import {Coords} from '../json-petri-net';
import {Transition} from './transition';
import {Diagram} from './diagram';
import { IntermediatePoint } from './intermediatePoint';
import { BehaviorSubject, Observable } from 'rxjs';
import {Place} from "./place";

export class Line {

    private readonly _id: string;
    private _sourcePosition: Coords;
    private _targetPosition: Coords;
    private _source: Element;
    private _target: Element;
    private _tokens: number;
    private _intermediatePoints$: BehaviorSubject<IntermediatePoint[]>;
    private _marker: SVGElement | undefined;
    private _draggingCircle : null | IntermediatePoint = null;
    private _svgElement: SVGElement;
    private _contextMenuOpen:boolean = false;


    constructor(id: string, source: Element, target: Element, coords?: Coords[], tokens?: number) {

        this._id = id;
        this._source = source;
        this._target = target;
        this._sourcePosition = {x: source.x, y: source.y};
        this._targetPosition = {x: target.x, y: target.y};
        this._tokens = tokens ?? 1;
        this._intermediatePoints$ = new BehaviorSubject<IntermediatePoint[]>(coords?.map(c => { return new IntermediatePoint(c.x, c.y, false)}) || []);
        this.addVirtualPoints()

        this._svgElement = this.createSVG();
        this._intermediatePoints$.getValue().forEach((intermediatePoint) => {
            if(intermediatePoint.svg) {
                this._svgElement.appendChild(intermediatePoint.svg)

            }

        });

        this._intermediatePoints$.subscribe(() => {
            this._svgElement?.querySelector('polyline')?.setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`);

        });




        source.getPositionChangeObservable().subscribe((source) => {
            this.updateSource({x: source.x, y: source.y});
            // Update des Schnittpunkts von Linie und Transition
            let refX: number = this.updateMarker();
            this._marker?.setAttribute('refX', refX.toString());

        });
        target.getPositionChangeObservable().subscribe((target) => {
            this.updateTarget({x: target.x, y: target.y});
            // Update des Schnittpunkts von Linie und Transition
            let refX: number = this.updateMarker();
            this._marker?.setAttribute('refX', refX.toString());
        });
    }

    get intermediatePoints$(): Observable<IntermediatePoint[]> {
        return this._intermediatePoints$.asObservable();
    }

    public get intermediatePoints(): IntermediatePoint[] {
        return this._intermediatePoints$.getValue();
    }

    public updateIntermediatePoints(intermediatePoints: IntermediatePoint[]) {
        this._intermediatePoints$.next(intermediatePoints);

    }

    get id(): string {
        return this._id;
    }

    get source(): Element {
        return this._source;
    }


    get target(): Element {
        return this._target;
    }


    get tokens(): number {
        return this._tokens;
    }

    set tokens(value: number) {
        this._tokens = value;
    }

    get svgElement(): SVGElement{
        return this._svgElement
    }


    get coords(): Coords[] | undefined {
        return this.intermediatePoints?.filter(i => !i.isVirtual).map(c => {return {x: c.x, y: c.y}});
    }

    set coords(coords: Coords[]) {
        this.updateIntermediatePoints(coords.map(c => {return new IntermediatePoint(c.x, c.y, false)}));
       
    }


    //Iterate through found coords and return them as string
    private getCoordsString(): string {
        let result = '';
        if (this.intermediatePoints.length > 0) {

            this.intermediatePoints.filter(c => !c.isVirtual).forEach(coord => {
                result += coord.x + ',' + coord.y + ' ';
            });
        }
        return result;
    }

    public calcMidCoords(): Coords {
        let midCoords: Coords = {x: 0, y: 0}; // Initialize with default values
    
        if (this.coords && this.coords.length > 0) {
            // Calculate the total length of the polyline
            let totalLength = 0;
            let lastX = this._source.x;
            let lastY = this._source.y;

            this.coords.forEach(coord => {
                totalLength += Math.hypot(coord.x - lastX, coord.y - lastY);
                lastX = coord.x;
                lastY = coord.y;
            });
            totalLength += Math.hypot(this._target.x - lastX, this._target.y - lastY);
    
            // Find the midpoint
            let accumulatedLength = 0;
            lastX = this._source.x;
            lastY = this._source.y;
    
            for (let i = 0; i < this.coords.length; i++) {
                const coord = this.coords[i];
                const segmentLength = Math.hypot(coord.x - lastX, coord.y - lastY);
                accumulatedLength += segmentLength;
    
                if (accumulatedLength >= totalLength / 2) {
                    const ratio = (accumulatedLength - totalLength / 2) / segmentLength;
                    midCoords.x = coord.x - ratio * (coord.x - lastX);
                    midCoords.y = coord.y - ratio * (coord.y - lastY);
                    return midCoords;
                }
    
                lastX = coord.x;
                lastY = coord.y;
            }
    
            // If the midpoint wasn't found in the loop, it's at the last segment
            // This case might actually be unnecessary because the loop should always find the midpoint.
            // However, keeping this as a fallback.
            const ratio = (totalLength / 2 - accumulatedLength) / Math.hypot(this._target.x - lastX, this._target.y - lastY);
            midCoords.x = lastX + ratio * (this._target.x - lastX);
            midCoords.y = lastY + ratio * (this._target.y - lastY);
        } else {
            // If there are no intermediate points, just calculate the midpoint between source and target
            midCoords.x = (this._source.x + this._target.x) / 2;
            midCoords.y = (this._source.y + this._target.y) / 2;
        }
    
        return midCoords;
    }

    createSVG(): SVGElement {

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', this._id.toString());

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', (`${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`))
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('fill', 'transparent');
        line.style.cursor = 'pointer';

        group.appendChild(line);

        let refX: number;
        refX = this.updateMarker();
         // Marker
         const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
         marker.setAttribute('id', `arrowhead-${this._id}`);
         marker.setAttribute('markerWidth', '10');
         marker.setAttribute('markerHeight', '10');
         marker.setAttribute('refX', refX.toString());
         marker.setAttribute('refY', '5');
         marker.setAttribute('orient', 'auto-start-reverse');
         marker.setAttribute('markerUnits', 'strokeWidth');

         // Path Element für Pfeilspitze
         const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         arrowhead.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
         arrowhead.setAttribute('fill', 'black');

         marker.appendChild(arrowhead);
         this._marker = marker;

         group.appendChild(marker);

        const markerId = `url(#arrowhead-${this._id})`;
        line.setAttribute('marker-end', markerId);

        //Get mid coord of Polyline
        const midCoords = this.calcMidCoords();

        //Create background circle
        const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        backgroundCircle.setAttribute('cx', midCoords.x.toString());
        backgroundCircle.setAttribute('cy', midCoords.y.toString());
        backgroundCircle.setAttribute('r', '8');

        if (this._tokens > 1)
            backgroundCircle.setAttribute('fill', 'white');
        else
            backgroundCircle.setAttribute('fill', 'transparent');
        group.appendChild(backgroundCircle);

        const token = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        token.setAttribute('x', midCoords.x.toString());
        token.setAttribute('y', midCoords.y.toString());
        token.setAttribute('text-anchor', 'middle');
        token.setAttribute('dy', '.3em');

        if (this._tokens > 1)
            token.textContent = this._tokens.toString();
        group.appendChild(token);

        window.addEventListener('mousemove', (event) => {

            event.stopPropagation();
            if(!this._draggingCircle) return;
            this.handleMouseMove(event);

        });

        this.intermediatePoints?.forEach((intermediatePoint) => {
            this.addEventListenerForIntermediatePoints(intermediatePoint);
        });

        this._svgElement = group;

        return group;


    }


    private addEventListenerForIntermediatePoints(intermediatePoint: IntermediatePoint) {

        const handleMouseDown = () => {
            this._draggingCircle = intermediatePoint;
            this._draggingCircle.isVirtual = false;
            this.updateIntermediatePoints(this.intermediatePoints);
            Diagram.drawingIsActive = true;

        };

        const handleMouseUp = () => {
            Diagram.drawingIsActive = false;
            this.intermediatePoints?.filter(c => c.isVirtual).forEach((intermediatePoint) => {

                intermediatePoint.remove()});
            this._draggingCircle = null;
            this.updateIntermediatePoints(this.intermediatePoints.filter(c => !c.isVirtual));
            this.addVirtualPoints();


        };

        const handleMouseOver = (event: MouseEvent) => {
            const circle = event.target as SVGElement;
            circle.setAttribute('fill', 'gray');

        };

        const handleMouseOut = (event: MouseEvent) => {
            const circle = event.target as SVGElement;
            circle.setAttribute('fill', 'transparent');

        };

        intermediatePoint.svg?.addEventListener('mouseover', handleMouseOver);
        intermediatePoint.svg?.addEventListener('mouseout', handleMouseOut);
        intermediatePoint.svg?.addEventListener('mousedown', handleMouseDown);
        intermediatePoint.svg?.addEventListener('mouseup', handleMouseUp);

        intermediatePoint.svg?.addEventListener('contextmenu', (event) => {
            if(this._contextMenuOpen) return;
            this._contextMenuOpen = true;
            event.preventDefault();
            event.stopPropagation();
            const div = this.createContextmenu(event.clientX, event.clientY);

            window.addEventListener('click', (event) => {
                event.stopPropagation();
                div.remove();
                this._contextMenuOpen = false;
            });
            div.addEventListener('click', () => {

                div.remove();
                intermediatePoint.remove();

                this.removeCoord(intermediatePoint);

                this.intermediatePoints?.filter(c => c.isVirtual).forEach((intermediatePoint) => {
                    intermediatePoint.remove()
                });

                this.updateIntermediatePoints(this.intermediatePoints.filter(c => !c.isVirtual));
                this._draggingCircle = null;

                this.addVirtualPoints();
                this._contextMenuOpen = false;
                this.updateLineToken();

            });

        });

    }

    private createContextmenu(x:number, y:number): HTMLElement {
        const div = document.createElement('div');
            div.innerHTML =`
            <div style="position: fixed; z-index: 100; background-color: white; padding: 5px; cursor:pointer; left: ${x + 20}px; top: ${y + 5 }px; box-shadow: 1px 1px 22px -6px black" onMouseOver="this.style.background='gray'" onMouseOut="this.style.background='white'">
                <div class="context-menu-item" id="delete">Delete point</div>
            </div>
            `
            document.body.appendChild(div);
            return div;
    }


    private updateMarker(): number {

        if (this._target instanceof Transition) {

            const x1 = this._source.x;
            const y1 = this._source.y;
            const x2 = this._target.x;
            const y2 = this._target.y;
            const width = this._target.width;
            const height = this._target.height;

            const leftX = this._target.x - (width / 2);
            const rightX = this._target.x + (width / 2);
            const upperY = this._target.y + (height / 2);
            const lowerY = this._target.y - (height / 2);
            // Berechne m die Steigung der Geraden
            const m = (y2 - y1) / (x2 - x1);
            // Berechne den y-Achsenabschnitt b
            const b = y1 - m * x1;

            const intersectionpointsX: Array<number> = [(upperY - b) / m, (lowerY - b) / m, leftX, rightX];
            const intersectionpointsY: Array<number> = [upperY, lowerY, m * leftX + b, m * rightX + b];

            for (let i = 0; i < 4; i++) {

                const withinRectangle =
                    intersectionpointsX[i] >= leftX &&
                    intersectionpointsX[i] <= rightX &&
                    intersectionpointsY[i] >= lowerY &&
                    intersectionpointsY[i] <= upperY;

                if (withinRectangle) {
                    let distance = this.calculateDistance(x2, y2, intersectionpointsX[i], intersectionpointsY[i]);
                    return distance + 10;
                }
            }

            return 35;
        } else {
            return 35;
        }
    }


    calculateDistance(x2: number, y2: number, x3: number, y3: number): number {
        const distance: number = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
        return distance;

    }

    addVirtualPoints() {

        let last_coord:{x:number, y:number} = {x: this._source.x, y: this._source.y};

            if(this.intermediatePoints.length > 0){
                this.intermediatePoints.forEach((intermediatePoint) => {
                    if(intermediatePoint.isVirtual) intermediatePoint.remove();
                });
                this.updateIntermediatePoints(this.intermediatePoints.filter(i => !i.isVirtual));

                this.intermediatePoints.forEach((intermediatePoint) => {

                    let midPoint = new IntermediatePoint((last_coord.x + intermediatePoint.x) / 2, (last_coord.y + intermediatePoint.y) / 2, true);
                    this.updateIntermediatePoints(this.intermediatePoints.reduce((acc, curr, i) => {

                        if (i === this.intermediatePoints.indexOf(intermediatePoint)) {
                            acc.push(midPoint);
                        }
                        acc.push(curr);

                        return acc;
                    }, [] as IntermediatePoint[]));

                    last_coord = {x: intermediatePoint.x, y: intermediatePoint.y};

                });


                this.updateIntermediatePoints([...this.intermediatePoints, new IntermediatePoint((last_coord.x + this.target.x) /2, (last_coord.y + this.target.y) / 2, true)])

            }


        else{

            this.updateIntermediatePoints([new IntermediatePoint((this.source.x + this.target.x) /2, (this.source.y + this.target.y) / 2, true)])
         }

         // add intermediatePoints to svgElement
        this.intermediatePoints?.forEach((intermediatePoint) => {

            if(intermediatePoint.svg && this._svgElement) this._svgElement.appendChild(intermediatePoint.svg);
        });
        // add eventListeners to intermediatePoints
         this.intermediatePoints.forEach((intermediatePoint) => {
            this.addEventListenerForIntermediatePoints(intermediatePoint);
         });


    }


    removeCoords(): void {
        this.cleanupAllCircleSvgElements();
        this.updateIntermediatePoints([]) ;
        this._svgElement?.querySelector('polyline')?.setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`);
        this.updateLineToken();
    }

    removeCoord(intermediatePoint: IntermediatePoint){
        this.updateIntermediatePoints(this.intermediatePoints.filter(c => c !== intermediatePoint));
        intermediatePoint.remove();
    }

    private cleanupAllCircleSvgElements() {
        this.svgElement?.querySelectorAll('.intermediatePoint').forEach((circle) => {
            circle.remove();
        });

    }

    handleMouseMove(event: MouseEvent) {
        const svgElement = document.getElementById('canvas');
        const svgContainer = svgElement?.getBoundingClientRect();

        let x = ((event.clientX - svgContainer!.left) * Diagram.zoomFactor) + Diagram.viewBox!.x;
        let y = ((event.clientY - svgContainer!.top) * Diagram.zoomFactor) + Diagram.viewBox!.y;

        this._draggingCircle!.update(x, y);
        this.updateIntermediatePoints(this.intermediatePoints);

        this.updateLineToken();

    }

    private updateLineToken(){
        
         // Positionen der Kantengewichte werden mit aktualisiert
         const midCoords = this.calcMidCoords();
         const midCircle = this.svgElement?.querySelectorAll('circle')[0]

         midCircle?.setAttribute('cx', midCoords.x.toString());
         midCircle?.setAttribute('cy', midCoords.y.toString());
         this.svgElement?.querySelector('text')?.setAttribute('x', midCoords.x.toString());
         this.svgElement?.querySelector('text')?.setAttribute('y', midCoords.y.toString());
    }

    private updateSource(updatedPosition: Coords): void {
        const sugiyamaButton = document.querySelector('.sugiyama') as HTMLElement;
        const springEmbedderButton = document.querySelector('.spring-embedder') as HTMLElement;

        if (this._svgElement) {

            if (this._svgElement.childNodes[0] instanceof SVGElement) {
                this._svgElement.childNodes[0].setAttribute('points', `${updatedPosition.x},
                    ${updatedPosition.y} ${this.getCoordsString()}${this._targetPosition?.x},
                        ${this._targetPosition?.y}`);
            }
            this._sourcePosition = {x: updatedPosition.x, y: updatedPosition.y};

            // Alle svg circle elemente löschen
            this.cleanupAllCircleSvgElements();

            this.updateLineToken();

            if(!sugiyamaButton.classList.contains('selected') && !springEmbedderButton.classList.contains('selected')) this.addVirtualPoints();

        }


    }

    private updateTarget(updatedPosition: Coords): void {

        const sugiyamaButton = document.querySelector('.sugiyama') as HTMLElement;
        const springEmbedderButton = document.querySelector('.spring-embedder') as HTMLElement;

        if (this._svgElement) {
            if (this._svgElement.childNodes[0] instanceof SVGElement) {
                this._svgElement.childNodes[0].setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${updatedPosition.x},${updatedPosition.y}`);
            }
            this._targetPosition = {x: updatedPosition.x, y: updatedPosition.y};

        // Alle svg circle elemente löschen
        this.cleanupAllCircleSvgElements();

        this.updateLineToken();
      

        if(!sugiyamaButton.classList.contains('selected') && !springEmbedderButton.classList.contains('selected')) this.addVirtualPoints();

    }
}

    public isAlreadyConnected(circle: Place, rect: Transition, circleClicked: boolean): boolean {
        // Überprüfen, ob die Kante die angegebenen Elemente schon verbindet
        if(circleClicked) {
            return this._source === rect && this._target === circle;
        }
        return this._source === circle && this._target === rect;
    }
}

