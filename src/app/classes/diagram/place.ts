import { Element } from 'src/app/classes/diagram/element';
import { Transition } from './transition';

export class Place extends Element {

    private _radius: number;
    private _amountToken: number;
    private _children: Array<Transition>;

    constructor(id: string, x: number, y: number) {
        super(id, x, y);
        this._radius = 25; // Default Radius
        this._amountToken = 0; //Default sind keine Marken gesetzt
        this._children = [];
    }

    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
    }

    get amountToken(): number {
        return this._amountToken;
    }

    set amountToken(value: number) {
        this._amountToken = value;
    }

    get children(): Array<Transition> {
        return this._children;
    }

    set children(value: Array<Transition>) {
        this._children = value;
    }

    override createSVG(){

        const circle = super.createSVG('circle');
        circle.setAttribute('id', this.id.toString());
        circle.setAttribute('cx', this.x.toString());
        circle.setAttribute('cy', this.y.toString());
        circle.setAttribute('r', this._radius.toString());
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', '2');
        return circle;
    }

}
