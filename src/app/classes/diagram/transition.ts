import { Element } from 'src/app/classes/diagram/element';
import { Place } from './place';

export class Transition extends Element {

    private _isActive: boolean;
    private _width: number;
    private _height: number;
    private _children: Array<Place>;
    private _label: string;

    constructor(id: string, x: number, y: number, label?: string) {
        super(id, x, y);
        this._isActive = false; //Standardmäßig nicht aktiviert
        this._width = 20;
        this._height = 40;
        this._children = [];
        this._label = label ?? '';
    }

    get isActive(): boolean {
        return this._isActive;
    }

    set isActive(value: boolean) {
        this._isActive = value;
    }

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
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
        const group = super.createSVG('g');
        group.setAttribute('id', this.id);
        group.setAttribute('transform', `translate(${this.x - this.width / 2}, ${this.y - this.height / 2})`);
        //Transition
        const rect = super.createSVG('rect');
        rect.setAttribute('id', this.id.toString());
        rect.setAttribute('width', this.width.toString());
        rect.setAttribute('height', this.height.toString());
        rect.setAttribute('fill', 'black');
        rect.setAttribute('stroke', 'black');
        rect.setAttribute('stroke-width', '2');
        group.appendChild(rect);

        //Marker
        // const marker = super.createSVG('text');
        // marker.setAttribute('x', this.x.toString());
        // marker.setAttribute('y', this.y.toString());
        // marker.setAttribute('text-anchor', 'middle');
        // marker.setAttribute('dy', '.3em');
        // marker.textContent = this._amountToken.toString();
        // group.appendChild(marker);

        //Text
        const text = super.createSVG('text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'central');
        text.setAttribute('dy', `${this.height + 25}`);
        text.setAttribute('dx', `${this.width / 2}`);
        text.textContent = this._label;
        group.appendChild(text);


        super.registerSvg(group);
        return group;
    }


}
