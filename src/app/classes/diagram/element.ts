export class Element {
    private readonly _id: string;
    private _x: number;
    private _y: number;
    private _svgElement: SVGElement | undefined;

    constructor(id: string, x?: number , y?: number) {
        this._id = id;
        this._x = x ?? 0;
        this._y = y ?? 0;
    }

    get id(): string {
        return this._id;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get svgElement(): SVGElement | undefined {
        return this._svgElement;
    }

    set svgElement(svgElement: SVGElement) {
        this._svgElement = svgElement;
    }

    public registerSvg(svg: SVGElement) {
        this._svgElement = svg;
    }

    public createSVG(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }


}
