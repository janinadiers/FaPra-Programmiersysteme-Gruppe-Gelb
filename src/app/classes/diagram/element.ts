import { BehaviorSubject, Observable} from 'rxjs';
import { Coords } from '../json-petri-net';

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
            this.processMouseDown(event);
        };
        this._svgElement.onmouseup = (event) => {
            this.processMouseUp(event);
        };
        this._svgElement.onmousemove = (event) => {
            this.processMouseMove(event);
        }
    }

    private processMouseDown(event: MouseEvent) {
       
        
        if (this._svgElement === undefined) {
            return;
        }
        this._isDragging = true;
        //this._svgElement.setAttribute('fill', 'red');
    }

    private processMouseUp(event: MouseEvent) {
        if (this._svgElement === undefined) {
            return;
        }
       
        
        //this._svgElement.setAttribute('fill', 'black');
        if (this._isDragging) {
            this._isDragging = false;

        }
    }

    private processMouseMove(event: MouseEvent) {
        if (this._svgElement === undefined) {
            return;
        }

        const svgElement = document.getElementById('canvas');
        const svgContainer = svgElement?.getBoundingClientRect();
        // Berechnung der Maus Koordinanten relativ zum SVG Element
        const mouseX = event.clientX - svgContainer!.left;
        const mouseY = event.clientY - svgContainer!.top;
        if (this._isDragging) {
            
            this.x = mouseX;
            this.y = mouseY;
            
            if(this.svgElement && this.svgElement instanceof SVGCircleElement){
                this.svgElement.setAttribute('cx', this.x.toString());
                this.svgElement.setAttribute('cy', this.y.toString());
            }
            else if(this.svgElement && this.svgElement instanceof SVGRectElement){
                let transitionWidth = parseInt(this.svgElement.getAttribute('width')!);
                let transitionHeight = parseInt(this.svgElement.getAttribute('height')!);
                
                this.svgElement.setAttribute('x', (this.x - transitionWidth / 2).toString());
                this.svgElement.setAttribute('y', (this.y - transitionHeight / 2).toString());
            }
   
           
        }
    }

    public createSVG(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }


}
