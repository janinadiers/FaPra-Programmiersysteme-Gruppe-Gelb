import { Element } from 'src/app/classes/diagram/element';
import { Coords } from '../json-petri-net';
import {BehaviorSubject, Observable} from 'rxjs';


export class Line {

    private readonly _id: string;
    // private _source: Element;
    // private _target: Element;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;
    private _coords?: Coords[];
    private _source$: BehaviorSubject<Element> = new BehaviorSubject<Element>(new Element(''));
    private _target$: BehaviorSubject<Element> = new BehaviorSubject<Element>(new Element(''));

    constructor(id: string, source: Element, target: Element, coords?: Coords[]) {
        this._id = id;
        this._source$ = new BehaviorSubject<Element>(source);
        this._target$ = new BehaviorSubject<Element>(target);
        this._tokens = 0;      //Standardmäßig keine Marken
        this._coords = coords;  //undefined if not given
      
    }

    get id(): string {
        return this._id;
    }

    // get source(): Element {
    //     return this._source;
    // }

    set source(value: Element) {
        this._source$ = new BehaviorSubject<Element>(value);
    }

    get source(): Element {
        return this._source$.getValue();
       
    }



    get target(): Element {
        return this._target$.getValue();
    }

    set target(value: Element) {
        this._target$ = new BehaviorSubject<Element>(value);
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
        console.log('Creating SVG', this.source, this.target);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', (`${this.source.x},${this.source.y} ${this.getCoordsString()}${this.target.x},${this.target.y}`))
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

