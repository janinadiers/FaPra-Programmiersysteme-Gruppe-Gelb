import {Element} from 'src/app/classes/diagram/element';
import {Coords} from '../json-petri-net';
import {Transition} from './transition';

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

    constructor(id: string, source: Element, target: Element, coords?: Coords[], tokens?: number) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._tokens = tokens ?? 1;      // sobald eine Linie existiert, hat sie das Gewicht 1
        this._coords = coords;  //undefined if not given
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
        this._coords = coods;
    }

    private updateSource(updatedPosition: Coords): void {

        if (this._svgElement) {
            if (this._svgElement.childNodes[0] instanceof SVGElement) {
                if ((document.getElementById('algorithm-select') as HTMLSelectElement).value === 'free') //Only add midCoords if no algorithm selected
                    this._svgElement.childNodes[0].setAttribute('points', `${updatedPosition.x},
                        ${updatedPosition.y} ${this.getCoordsString()}${this._targetPosition?.x},
                            ${this._targetPosition?.y}`);
                else 
                    this._svgElement.childNodes[0].setAttribute('points', `${updatedPosition.x},
                        ${updatedPosition.y} ${this._targetPosition?.x},
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
                if ((document.getElementById('algorithm-select') as HTMLSelectElement).value === 'free') //Only add midCoords if no algorithm selected
                    this._svgElement.childNodes[0].setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${updatedPosition.x},${updatedPosition.y}`);
                else 
                    this._svgElement.childNodes[0].setAttribute('points', `${this._sourcePosition?.x},${this._sourcePosition?.y} ${updatedPosition.x},${updatedPosition.y}`);
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
            this._coords.forEach(coord => {
                result += coord.x + ',' + coord.y + ' ';
            });
        }
        return result;
    }

    public calcMidCoords(): Coords {
        let midCoords: Coords = {x: -50000, y: -50000}; //Placeholder to define Coords variable

        if (this._coords) {
            //Calc mid coord of the polyline (Sum the distances between each pair of consecutive points in the polyline)
            let totalLength = 0;
            let lastX = this._source.x;
            let lastY = this._source.y;
            this._coords.forEach(coord => {
                totalLength += Math.hypot(coord.x - lastX, coord.y - lastY);
                lastX = coord.x;
                lastY = coord.y;
            });
            totalLength += Math.hypot(this._target.x - lastX, this._target.y - lastY);

            //Find the midpoint (Traverse the polyline until the accumulated length is half of the total length)
            let accumulatedLength = 0;
            lastX = this._source.x;
            lastY = this._source.y;
            for (let i = 0; i < this._coords.length; i++) {
                const coord = this._coords[i];
                const segmentLength = Math.hypot(coord.x - lastX, coord.y - lastY);
                if (accumulatedLength + segmentLength >= totalLength / 2) {
                    const ratio = (totalLength / 2 - accumulatedLength) / segmentLength;
                    midCoords.x = lastX + ratio * (coord.x - lastX);
                    midCoords.y = lastY + ratio * (coord.y - lastY);
                    return midCoords;
                }
                accumulatedLength += segmentLength;
                lastX = coord.x;
                lastY = coord.y;
            }
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

        this.addHoverEventForBackgroundCircle(backgroundCircle, token);

        this._svgElement = group;
        return group;
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
            if (this._tokens > 1)
                backgroundCircle.setAttribute('fill', 'white');
            else
                backgroundCircle.setAttribute('fill', 'transparent');
        })
    }


    // Might be needed for "Markenspiel"
    // public registerSvg(svg: SVGElement) {
    //     this._svgElement = svg;
    //     this._svgElement.onmousedown = (event) => {
    //         this.processMouseDown(event);
    //     };
    //     this._svgElement.onmouseup = (event) => {
    //         this.processMouseUp(event);
    //     };
    // }

}

