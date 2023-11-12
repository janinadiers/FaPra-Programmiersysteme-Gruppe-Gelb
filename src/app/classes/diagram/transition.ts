import { Element } from 'src/app/classes/diagram/element';
import { Place } from './place';

export class Transition extends Element {

    private _isActive: boolean;
    private _width: number;
    private _height: number;
    private _children: Array<Place>;

    constructor(id: string, x: number, y: number) {
        super(id, x, y);
        this._isActive = false; //Standardmäßig nicht aktiviert
        this._width = 20;
        this._height = 40;
        this._children = [];
    }

    get isActive(): boolean {
        return this._isActive;
    }

    set isActive(value: boolean) {
        this._isActive = value;
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
    }

    get children(): Array<Place> {
        return this._children;
    }

    set children(value: Array<Place>) {
        this._children = value;
    }

    override createSVG(){
        const rect = super.createSVG('rect');
        rect.setAttribute('id', this.id.toString());
        rect.setAttribute('x', this.x.toString());
        rect.setAttribute('y', this.y.toString());
        rect.setAttribute('width', this._width.toString());
        rect.setAttribute('height', this._height.toString());
        rect.setAttribute('fill', 'black');
        rect.setAttribute('stroke', 'black');
        rect.setAttribute('stroke-width', '2');
        return rect;
    }


}
