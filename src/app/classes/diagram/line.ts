import { Element } from 'src/app/classes/diagram/element';


export class Line {

    private readonly _id: string;
    private _source: Element;
    private _target: Element;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;

    constructor(id: string, source: Element, target: Element) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._tokens = 0;      //Standardmäßig keine Marken
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


    createSVG() {

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('x1', this._source.x.toString());
        line.setAttribute('y1', this._source.y.toString());
        line.setAttribute('x2', this._target.x.toString());
        line.setAttribute('y2', this._target.y.toString());
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');       
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

