export class Element {
    private readonly _id: string;
    private _x: number;
    private _y: number;
    private _svgElement: SVGElement | undefined;
    private _x2: number;
    private _y2: number;
    private _source: Element | undefined;
    private _target: Element | undefined;

    constructor(id: string) {
        this._id = id;
        this._x = 0;
        this._y = 0;
        this._x2 = 0;
        this._y2 = 0;
        this._source = undefined;
        this._target = undefined;
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


    get x2(): number {
        return this._x2;
    }

    set x2(value: number) {
        this._x2 = value;
    }

    get y2(): number {
        return this._y2;
    }

    set y2(value: number) {
        this._y2 = value;
    }

    get source(): Element | undefined {
        return this._source;
    }

    set source(value: Element) {
        this._source = value;
    }

    get target(): Element | undefined {
        return this._target;
    }

    set target(value: Element) {
        this._target = value;
    }
    
    public registerSvg(svg: SVGElement) {
        this._svgElement = svg;
        this._svgElement.onmousedown = (event) => {
            this.processMouseDown(event);
        };
        this._svgElement.onmouseup = (event) => {
            this.processMouseUp(event);
        };
    }

    private processMouseDown(event: MouseEvent) {
        if (this._svgElement === undefined) {
            return;
        }
        this._svgElement.setAttribute('fill', 'red');
    }

    private processMouseUp(event: MouseEvent) {
        if (this._svgElement === undefined) {
            return;
        }
        this._svgElement.setAttribute('fill', 'black');
    }

    get svgElement(): SVGElement | undefined {
        return this._svgElement;
    }

    set svgElement(svgElement: SVGElement) {
        this._svgElement = svgElement;
    }
}
