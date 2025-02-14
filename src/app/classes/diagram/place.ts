import { Element } from 'src/app/classes/diagram/element';
import { Transition } from './transition';
import { Coords } from '../json-petri-net';


export class Place extends Element {

    private _radius: number;
    private _amountToken: number;
    private _children: Array<Transition>;
    private _parents: Array<Transition>;

    constructor(id: string, x: number, y: number, amountToken?: number) {
        super(id, x, y);
        this._radius = 25; // Default Radius
        this._amountToken = amountToken ?? 0; //Default sind keine Marken gesetzt
        this._children = [];
        this._parents = [];
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

    set children(object: Transition) {
        this._children.push(object);
    }

    get parents(): Array<Transition> {
        return this._parents;
    }

    set parents(transition: Transition) {
        this._parents.push(transition);
    }

    // Methode, um zu überprüfen, ob ein Klick innerhalb der Begrenzungen des Places liegt
    isClicked(x: number, y: number): boolean {
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        return distance <= this._radius;
    }

    updateGroup(newPosition: Coords) {
        super.x = newPosition.x;
        super.y = newPosition.y;

        super.svgElement?.setAttribute('transform', `translate(${newPosition.x}, ${newPosition.y})`);
    }

    override createSVG(){
        if (this.svgElement) {
            return this.svgElement;
        }

        const group = super.createSVG('g');
        group.setAttribute('id', this.id);
        group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
        //Circle
        const circle = super.createSVG('circle');
        circle.setAttribute('id', this.id);
        circle.setAttribute('r', this._radius.toString());
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';
        group.appendChild(circle);

        //Marker
        const marker = super.createSVG('text');
        marker.setAttribute('text-anchor', 'middle');
        marker.setAttribute('dy', '.3em');
        if (this._amountToken > 0){
            marker.textContent = this._amountToken.toString();

        }

        group.appendChild(marker);

        //ID-Text unten drunter
        const text = super.createSVG('text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'central');
        text.setAttribute('dy', `${(this._radius ) + 25}`);
        text.textContent = this.id;
        group.appendChild(text);

        super.registerSvg(group);
        return group;
    }

}
