import { Element } from 'src/app/classes/diagram/element';
import { Coords } from '../json-petri-net';


export class Line {

    private readonly _id: string;
    private _source: Element;
    private _target: Element;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;
    private _coords?: Coords[];

    constructor(id: string, source: Element, target: Element, coords?: Coords[]) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._tokens = 0;      //Standardmäßig keine Marken
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

    private getCoordsString(): string {
        const result = '';
        if(this._coords) {
            this._coords.forEach(coord => {
                result.concat(result + coord.x + ',' + coord.y + ' ');
            });
        } 
        return result;
    }


    createSVG() {

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', (`${this._source.x},${this._source.y} ${this.getCoordsString()}${this._target.x},${this._target.y}`))
        // line.setAttribute('x1', this._source.x.toString());
        // line.setAttribute('y1', this._source.y.toString());
        // line.setAttribute('x2', this._target.x.toString());
        // line.setAttribute('y2', this._target.y.toString());
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');       
        line.setAttribute('fill', 'transparent')
        this._svgElement = line;
        return line;
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

