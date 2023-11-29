import { Element } from 'src/app/classes/diagram/element';
import { Coords } from '../json-petri-net';


export class Line {

    private readonly _id: string;
    private _source: Element;
    private _target: Element;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;
    private _coords?: Coords[];

    constructor(id: string, source: Element, target: Element, coords?: Coords[], tokens?: number) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._tokens = tokens ?? 1;      // sobald eine Linie existiert, hat sie das Gewicht 1
        this._coords = coords;  //undefined if not given
    }

    get id(): string {
        return this._id;
    }

    get source(): Element {
        return this._source;
    }

    set source(value: Element) {
        this._source = value;
    }

    get target(): Element {
        return this._target;
    }

    set target(value: Element) {
        this._target = value;
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

    //Iterate through found coords and return them as string
    private getCoordsString(): string {
        let result = '';
        if(this._coords) {
            this._coords.forEach(coord => {
                result += coord.x + ',' + coord.y + ' ';
            });
        }
        return result;
    }

    private calcMidCoords(): Coords {
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
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', this._id.toString());

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', (`${this._source.x},${this._source.y} ${this.getCoordsString()}${this._target.x},${this._target.y}`))
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('fill', 'transparent');
        group.appendChild(line);

        //Get mid coord of Polyline
        const midCoords = this.calcMidCoords();

        //Create background circle
        const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        backgroundCircle.setAttribute('cx', midCoords.x.toString());
        backgroundCircle.setAttribute('cy', midCoords.y.toString());
        backgroundCircle.setAttribute('r', '8');
        if (this._tokens > 0)
            backgroundCircle.setAttribute('fill', 'white');
        else
            backgroundCircle.setAttribute('fill', 'transparent');
        group.appendChild(backgroundCircle);


        const token = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        token.setAttribute('x', midCoords.x.toString());
        token.setAttribute('y', midCoords.y.toString());
        token.setAttribute('text-anchor', 'middle');
        token.setAttribute('dy', '.3em');
        if (this._tokens > 0)
            token.textContent = this._tokens.toString();
        group.appendChild(token);

        this._svgElement = group;
        return group;
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

