import { Element } from 'src/app/classes/diagram/element';
import { Coords } from '../json-petri-net';
import {Observable} from 'rxjs';


export class Line  {

    private readonly _id: string;
    private _sourcePosition: Coords | undefined;
    private _targetPosition: Coords | undefined;
    private _source : Element | undefined;
    private _target : Element | undefined;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;
    private _coords?: Coords[];
    

    constructor(id: string, source: Element, target: Element, coords?: Coords[]) {
        this._id = id;
        this._tokens = 0;      //Standardmäßig keine Marken
        this._coords = coords;  //undefined if not given
        this._source = source;
        this._target = target;
        source.getPositionChangeObservable().subscribe((source) => {
            this._sourcePosition = source;
            this.updateSource(source);
            
        });
        target.getPositionChangeObservable().subscribe((target) => {
            this._targetPosition = target;
            this.updateTarget(target);
        
        });
    }


    get id(): string {
        return this._id;
    }

    get source(): Element | undefined {
        return this._source;
    }

    set source(value: Element) {
        this._source = value;
    }

    get target(): Element| undefined {
        return this._target;
    }

    set target(value: Element) {
        this._target = value;
    }

    get tokens(): number {
        return this._tokens;
    }

    set tokens(value: number) {
        this._tokens = value;
    }

    get svgElement(): SVGElement | undefined {
        return this._svgElement;
    }

    set svgElement(svgElement: SVGElement) {
        this._svgElement = svgElement;
    }

    get coords(): Coords[] | undefined {
        return this._coords;
    }

    set coords(coods: Coords[]) {
        this._coords = coods;
    }

    private updateSource(updatedPosition: Coords): void {
        console.log('updateLine', updatedPosition.x, updatedPosition.y);
        
        if(this._svgElement) {
            this._svgElement.setAttribute('points', (`${updatedPosition.x},${updatedPosition.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`));
        }

    }

    private updateTarget(updatedPosition: Coords): void {
        console.log('updateLine', updatedPosition.x, updatedPosition.y);
        
        if(this._svgElement) {
            this._svgElement.setAttribute('points', (`${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${updatedPosition.x},${updatedPosition.y}`));
        }

    }

    //Iterate through found coords and return them as string
    private getCoordsString(): string {
        let result = '';
        if(this._coords) {
            this._coords.forEach(coord => {
                result += coord.x + ',' + coord.y + ' ';
            });
        } 
        return result;
    }


    createSVG() {
        
        if(!this._sourcePosition || !this._targetPosition) { throw new Error('Source or target not defined');}
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', (`${this._sourcePosition.x},${this._sourcePosition.y} ${this.getCoordsString()}${this._targetPosition.x},${this._targetPosition.y}`))
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');       
        line.setAttribute('fill', 'transparent')
        this._svgElement = line;
        return line;
    }

    // Might be needed for "Markenspiel"
    // public registerSvg(svg: SVGElement) {
    //     this._svgElement = svg;
    //     this._svgElement.onmousedown = (event) => {
    //         this.processMouseDown(event);
    //     };
    //     this._svgElement.onmouseup = (event) => {
    //         this.processMouseUp(event);
    //     };
    // }

}

