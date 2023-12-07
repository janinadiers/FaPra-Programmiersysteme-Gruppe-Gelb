import { BehaviorSubject, Observable} from 'rxjs';
import { Coords } from '../json-petri-net';
import { Diagram } from './diagram';

export class Element  {
    private readonly _id: string;
    private _x: number;
    private _y: number;
    private _svgElement: SVGElement | undefined;
    private _isDragging = false;
    private _positionChange$: BehaviorSubject<Coords>;

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

    public registerSvg(svg: SVGElement) {

        this._svgElement = svg;
        this._svgElement.onmousedown = (event) => {
            event.stopPropagation();
            this.processMouseDown();
        };
        window.addEventListener('mouseup', (event) => {
            event.stopPropagation();
            this.processMouseUp();
        });
        window.addEventListener('mousemove', (event) => {
            event.stopPropagation();
            this.processMouseMove(event);
        })
    }


    private processMouseDown() {

        if (this._svgElement === undefined) {
            return;
        }

        // Wenn Toolbar aktiv, dann kein Dragging
        if(Diagram.drawingIsActive){
            return;
        }
        this._isDragging = true;
       
        
    }

    private processMouseUp() {
            
        if (this._svgElement === undefined) {
            return;
        }
        
        if (this._isDragging) {
            
            this._isDragging = false;
           
            

        }
        else{
            Diagram.algorithmIsActive = false;
        }
        
    }

    private processMouseMove(event: MouseEvent) {

        if (this._svgElement === undefined) {
            return;
        }

        if (this._isDragging) {
            Diagram.algorithmIsActive = true;
            const svgElement = document.getElementById('canvas');
            const svgContainer = svgElement?.getBoundingClientRect();
            // Berechnung der Maus Koordinanten relativ zum SVG Element
            this.x = ((event.clientX - svgContainer!.left) * Diagram.zoomFactor) + Diagram.viewBox!.x;
            this.y = ((event.clientY - svgContainer!.top) * Diagram.zoomFactor) + Diagram.viewBox!.y;

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
    }

    public createSVG(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
}
