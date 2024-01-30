import {Element} from 'src/app/classes/diagram/element';
import {Coords} from '../json-petri-net';
import {Transition} from './transition';
import {Diagram} from './diagram';

export class Line {

    private readonly _id: string;
    private _sourcePosition: Coords | undefined;
    private _targetPosition: Coords | undefined;
    private _source: Element;
    private _target: Element;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;
    private _coords?: Coords[];
    private _marker: SVGElement | undefined;
    private _draggingCircle : null | { circle: SVGElement, coords: Coords} = null;

    constructor(id: string, source: Element, target: Element, coords?: Coords[], tokens?: number) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._tokens = tokens ?? 1;      // sobald eine Linie existiert, hat sie das Gewicht 1
        this._coords = coords?.map( c =>  { return{ x: c.x, y: c.y, isVirtual : false}});  //undefined if not given
        this._sourcePosition = {x: source.x, y: source.y};
        this._targetPosition = {x: target.x, y: target.y};

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

    get svgElement(): SVGElement | undefined {
        return this._svgElement;
    }

    set svgElement(svgElement: SVGElement) {
        this._svgElement = svgElement;
    }

    get coords(): Coords[] | undefined {
        return this._coords;
    }

    set coords(coods: Coords[]) {
        this._coords = coods.map( c =>  { return{ x: c.x, y: c.y, isVirtual : c.isVirtual ?? false}});
    }

    private updateSource(updatedPosition: Coords): void {
        
        if (this._svgElement) {
            
            if (this._svgElement.childNodes[0] instanceof SVGElement) {
                this._svgElement.childNodes[0].setAttribute('points', `${updatedPosition.x},
                    ${updatedPosition.y} ${this.getCoordsString()}${this._targetPosition?.x},
                        ${this._targetPosition?.y}`);
            }            
            this._sourcePosition = {x: updatedPosition.x, y: updatedPosition.y};

            // Markierungen für die Gewichte an die Kante hängen
            let tokenCircleCx = this.calcMidCoords().x.toString();
            let tokenCircleCy = this.calcMidCoords().y.toString();

            if (!this.svgElement) {
                return;
            }
            this.svgElement!.querySelector('circle')!.setAttribute('cx', tokenCircleCx);
            this.svgElement!.querySelector('circle')!.setAttribute('cy', tokenCircleCy);
            this.svgElement!.querySelector('text')!.setAttribute('x', tokenCircleCx);
            this.svgElement!.querySelector('text')!.setAttribute('y', tokenCircleCy);
        }


    }

    private updateTarget(updatedPosition: Coords): void {
        
        if (this._svgElement) {
            if (this._svgElement.childNodes[0] instanceof SVGElement) {
                this._svgElement.childNodes[0].setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${updatedPosition.x},${updatedPosition.y}`);
            }
            this._targetPosition = {x: updatedPosition.x, y: updatedPosition.y};
        }

        // Markierungen für die Gewichte an die Kante hängen
        let tokenCircleCx = this.calcMidCoords().x.toString();
        let tokenCircleCy = this.calcMidCoords().y.toString();

        if (!this.svgElement) {
            return;
        }
        this.svgElement!.querySelector('circle')!.setAttribute('cx', tokenCircleCx);
        this.svgElement!.querySelector('circle')!.setAttribute('cy', tokenCircleCy);
        this.svgElement!.querySelector('text')!.setAttribute('x', tokenCircleCx);
        this.svgElement!.querySelector('text')!.setAttribute('y', tokenCircleCy);
    }

    //Iterate through found coords and return them as string
    private getCoordsString(): string {
        let result = '';
        if (this._coords) {
            this._coords.filter(c => !c.isVirtual).forEach(coord => {
                result += coord.x + ',' + coord.y + ' ';
            });
        }
        return result;
    }

    public calcMidCoords(): Coords {
        let midCoords: Coords = {x: -50000, y: -50000}; //Placeholder to define Coords variable

        if (this.coords) {
            //Calc mid coord of the polyline (Sum the distances between each pair of consecutive points in the polyline)
            let totalLength = 0;
            let lastX = this._source.x;
            let lastY = this._source.y;
            
            this.coords.forEach(coord => {
                totalLength += Math.hypot(coord.x - lastX, coord.y - lastY);
                lastX = coord.x;
                lastY = coord.y;
            });
            totalLength += Math.hypot(this._target.x - lastX, this._target.y - lastY);

            //Find the midpoint (Traverse the polyline until the accumulated length is half of the total length)
            let accumulatedLength = 0;
            lastX = this._source.x;
            lastY = this._source.y;

            for (let i = 0; i < this.coords.length; i++) {
                const coord = this.coords[i];
                const segmentLength = Math.hypot(coord.x - lastX, coord.y - lastY);
                accumulatedLength += segmentLength;
                if (accumulatedLength  >= totalLength / 2) {
                    const ratio = (accumulatedLength - (totalLength / 2)) / segmentLength;
                    midCoords.x = coord.x - ratio * (coord.x - lastX);
                    midCoords.y = coord.y - ratio * (coord.y - lastY);
                    return midCoords;
                }
                lastX = coord.x;
                lastY = coord.y;
            }
            // If the midpoint wasn't found in the loop, it's at the last segment
            const ratio = ((totalLength/2) - accumulatedLength) / Math.hypot(this._target.x - lastX, this._target.y - lastY);
            midCoords.x = lastX + ratio * (this._target.x - lastX);
            midCoords.y = lastY + ratio * (this._target.y - lastY);
        }

        midCoords.x = (this._source.x + this._target.x) / 2;
        midCoords.y = (this._source.y + this._target.y) / 2;

        return midCoords;
    }

    createSVG() {
        if (this._svgElement) {
            return this._svgElement;
        }

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', this._id.toString());

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', (`${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`))
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('fill', 'transparent');
        line.style.cursor = 'pointer';
        this._svgElement = line;
        
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

        
            this.addPossibleCoords()

            window.addEventListener('mousemove', (event) => {
                
                event.stopPropagation();
                
                if(!this._draggingCircle) return;
                
                this._draggingCircle.coords.isVirtual = false;
                
                this.handleMouseMove(event);
                
                
                
            });
            
            this.coords!.forEach((coord) => {
                const circle = this.createCircle(coord);
                group.appendChild(circle);
                this.addEventListenerForCoords(coord, circle, group);
            });
            
   
        this._svgElement = group;
     
        return group;
    }

    private createCircle(coord: Coords): SVGElement {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', coord.x.toString());
        circle.setAttribute('cy', coord.y.toString());
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'transparent');
        return circle;
    }

    private addEventListenerForCoords(coord: Coords, circle: SVGElement, group: SVGElement){
            console.log('add event listener for coords');
            
            
            if(!coord.isVirtual){
                
                circle.addEventListener('mousedown', () => {
                    this._draggingCircle = { circle, coords: coord };    
                    Diagram.drawingIsActive = true; 
                });
                
                window.addEventListener('mouseup', () => {
                    this._draggingCircle = null;
                    Diagram.drawingIsActive = false;
                });
                circle.addEventListener('mouseover', (event) => {
                    this.handleMouseOver(event);   
                }
                );
                circle.addEventListener('mouseout', (event) => {
                    this.handleMouseOut(event);
                });
            }

            else{
                
                circle.addEventListener('mouseover', (event) => {
                    this.handleMouseOver(event);
                }
                );
                circle.addEventListener('mouseout', (event) => {
                    this.handleMouseOut(event);
                });
                circle.addEventListener('mousedown', (event) => {
                    this._draggingCircle = { circle, coords: coord};
                    Diagram.drawingIsActive = true;
                        
                       
                });
                
                window.addEventListener('mouseup', () => {
                    // get coords of dragged circle
                let coord = this._draggingCircle?.coords;
                if(!coord) return;
                // get coords of circle before dragged circle
                let index = this.coords!.filter(c => !c.isVirtual).indexOf(coord);
                let previousCoords = index === 0 ? {x:this.source.x, y: this.source.y} : this.coords!.filter(c => !c.isVirtual)[index - 1];
                let nextCoords = index === this.coords!.filter(c => !c.isVirtual).length - 1 ? {x: this.target.x, y: this.target.y} : this.coords!.filter(c => !c.isVirtual)[index+ 1];
                let midPoint1 = {x: (previousCoords.x + coord.x) / 2, y: (previousCoords.y + coord.y) / 2, isVirtual: true};
                let midPoint2 = {x: (coord.x + nextCoords.x) / 2, y: (coord.y + nextCoords.y) / 2, isVirtual: true};
                this.coords!.splice(this.coords!.indexOf(coord) -1 , 0, midPoint1);
                this.coords!.splice(this.coords!.indexOf(coord) +1, 0, midPoint2);
                
                [midPoint1, midPoint2].forEach((coord) => {
                    let circle = this.createCircle(coord);
                    group.appendChild(circle);
                    this.addEventListenerForCoords(coord, circle, group); // Add event listener to the circle
                });
                    this._draggingCircle = null;
                    Diagram.drawingIsActive = false;
                    
                });
               
               
            }
                
            
        
    }

    private handleMouseOver(event: MouseEvent) {
        const circle = event.target as SVGElement;
        circle.setAttribute('fill', 'gray');

    }

    private handleMouseOut(event: MouseEvent) {
        const circle = event.target as SVGElement;
        circle.setAttribute('fill', 'transparent');
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

    addHoverEventForBackgroundCircle(backgroundCircle: SVGElement, token: SVGElement) {       
        backgroundCircle.addEventListener('mouseover', () => {
            
            backgroundCircle.setAttribute('fill', 'blue');
            token.setAttribute('fill', 'white');
            token.setAttribute('stroke', 'white');
        });

        backgroundCircle.addEventListener('mouseout', () => {
            token.setAttribute('fill', 'black');
            token.setAttribute('stroke', 'black');
            if (this._tokens > 1){
                backgroundCircle.setAttribute('fill', 'white');
            }
            else{
                // Da der backgroundCircle nicht nach jedem mouseout event transparent sein soll während man im Bearbeitungsmodus ist, wird hier überprüft, ob die Linie gerade ausgewählt ist
                if(!(backgroundCircle.getAttribute('stroke') === 'blue')){
                    backgroundCircle.setAttribute('fill', 'transparent');
                }
            }
        })
        
    }

    addPossibleCoords() {
        let last_coord:{x:number, y:number} = {x: this._source.x, y: this._source.y};
        let new_coords: Coords[] = [...this.coords!];
        if(this.coords){
            
            this.coords.forEach((coord) => {
                
                let midPoint = {x: (last_coord.x + coord.x) / 2, y: (last_coord.y + coord.y) / 2, isVirtual: true};
                
                new_coords.splice(new_coords.indexOf(coord), 0, midPoint);
                last_coord = coord;
                
            });
            new_coords.push({x: (last_coord.x + this._target.x) /2, y: (last_coord.y + this._target.y) / 2, isVirtual: true})  
                          
        }
        else{
            
            new_coords.push({x: (this.source.x + this._target.x) /2, y: (this.source.x + this._target.y) / 2, isVirtual: true});
         }
         this.coords = new_coords;
        
        

    }

    addHoverEventForLine(line: SVGElement) {
        line.addEventListener('mouseover', () => {
            line.setAttribute('stroke', 'blue');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('fill', 'transparent');
        });

        line.addEventListener('mouseout', () => {
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '1');
           line.setAttribute('fill', 'transparent');
        });
    }

    removeCoords(): void {
        this._coords = undefined;
        this._svgElement?.querySelector('polyline')?.setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`);

    }

    removeCoord(coord:Coords){
        this._coords?.splice(this._coords.indexOf(coord), 1);
    }

    handleMouseMove(event: MouseEvent) {
        const svgElement = document.getElementById('canvas');
        const svgContainer = svgElement?.getBoundingClientRect();

        // Calculate the new coords for the polyline
        let x = ((event.clientX - svgContainer!.left) * Diagram.zoomFactor) + Diagram.viewBox!.x;
        let y = ((event.clientY - svgContainer!.top) * Diagram.zoomFactor) + Diagram.viewBox!.y;

        this._draggingCircle!.coords.x = x;
        this._draggingCircle!.coords.y = y;

        

        this.svgElement?.querySelector('polyline')?.setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`);

        // Positionen der Kantengewichte werden mit aktualisiert
        const midCoords = this.calcMidCoords();
        const midCircle = this.svgElement?.querySelectorAll('circle')[0];

        midCircle?.setAttribute('cx', midCoords.x.toString());
        midCircle?.setAttribute('cy', midCoords.y.toString());
        this.svgElement?.querySelector('text')?.setAttribute('x', midCoords.x.toString());
        this.svgElement?.querySelector('text')?.setAttribute('y', midCoords.y.toString());
    }
            
       
    

}

