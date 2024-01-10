import { BehaviorSubject, Observable} from 'rxjs';
import { Coords } from '../json-petri-net';

export class Element  {
    private readonly _id: string;
    private _x: number;
    private _y: number;
    private _svgElement: SVGElement | undefined;
    private _positionChange$: BehaviorSubject<Coords>;
    private _isSelected = false;
    private _lastMouseMove = 0;

    constructor(id: string, x: number , y: number) {
        this._id = id;
        this._x = x
        this._y = y
        this._positionChange$ = new BehaviorSubject<Coords>({x: this._x, y: this._y});
        
    }

    updatePosition(newPosition: Coords) {
        
        this._positionChange$.next(newPosition);

    }

    getPositionChangeObservable(): Observable<Coords> {

        return this._positionChange$.asObservable();
    }

    get id(): string {
        return this._id;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        this.updatePosition({x: value, y: this._y});

    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        this.updatePosition({x: this._x, y: value});

    }

    get svgElement(): SVGElement | undefined {
        return this._svgElement;
    }

    set svgElement(svgElement: SVGElement) {
        this._svgElement = svgElement;
    }

    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    get lastMouseMove(): number {
        return this._lastMouseMove;
    }

    set lastMouseMove(value: number) {
        this._lastMouseMove = value;
    }

    public registerSvg(svg: SVGElement) {

        this._svgElement = svg;
    }

    public updateSVG(){
        this.svgElement?.childNodes.forEach((node) => {

            if(node instanceof SVGCircleElement){

                this.svgElement?.setAttribute('transform', `translate(${this.x}, ${this.y})`);
            }
            else if(node instanceof SVGRectElement){

                let transitionWidth = parseInt(node.getAttribute('width')!);
                let transitionHeight = parseInt(node.getAttribute('height')!);

                this.svgElement?.setAttribute('transform', `translate(${this.x - transitionWidth / 2}, ${this.y - transitionHeight / 2})`);
            }

        });
    }

    public createSVG(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
}
