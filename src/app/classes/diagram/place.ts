import { Element } from 'src/app/classes/diagram/element';
import { Transition } from './transition';


export class Place extends Element {

    private _radius: number;
    private _amountToken: number;
    private _children: Array<Transition>;
    private _parents: Array<Transition>;
    private _label: string;


    constructor(id: string, x: number, y: number, amountToken?: number, label?: string) {
        super(id, x, y);
        this._radius = 25; // Default Radius
        this._amountToken = amountToken ?? 0; //Default sind keine Marken gesetzt
        this._children = [];
        this._parents = [];
        this._label = label ?? id;

    }

    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
    }

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
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

    override createSVG(){
        if (this.svgElement) {
            return this.svgElement;
        }

        const group = super.createSVG('g');
        group.setAttribute('id', this._label);
        group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
        //Circle
        const circle = super.createSVG('circle');
        circle.setAttribute('id', this._label.toString());
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

        //Text
        const text = super.createSVG('text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'central');
        text.setAttribute('dy', `${(this._radius ) + 25}`);
        text.textContent = this._label.toString();
        group.appendChild(text);

        super.registerSvg(group);
        return group;
    }

}
