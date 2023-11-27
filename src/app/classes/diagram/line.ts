import { Element } from 'src/app/classes/diagram/element';
import { Coords } from '../json-petri-net';


export class Line {

    private readonly _id: string;
    private _source: Element;
    private _target: Element;
    private _tokens: number;
    private _svgElement: SVGElement | undefined;
    private _coords?: Coords[];
    private _marker: SVGElement | undefined;

    constructor(id: string, source: Element, target: Element, coords?: Coords[]) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._tokens = 0;      //Standardmäßig keine Marken
        this._coords = coords;  //undefined if not given
    }

    get id(): string {
        return this._id;
    }

    get source(): Element {
        return this._source;
    }

    set source(value: Element) {
        this._source = value;
    }

    get target(): Element {
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
        // Polyline
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('id', this._id.toString());
        line.setAttribute('points', `${this._source.x},${this._source.y} ${this.getCoordsString()} ${this._target.x},${this._target.y}`);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');       
        line.setAttribute('fill', 'transparent');
        this._svgElement = line;
    
        // Marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', `arrowhead-${this._id}`);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '35');
        marker.setAttribute('refY', '5');
        marker.setAttribute('orient', 'auto-start-reverse');
        marker.setAttribute('markerUnits', 'strokeWidth');
    
        // Path Element für Pfeilspitze
        const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowhead.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
        arrowhead.setAttribute('fill', 'black');
    
        marker.appendChild(arrowhead);

        this._marker = marker;
        document.querySelector('svg')?.appendChild(marker);

        const markerId = `url(#arrowhead-${this._id})`;
        line.setAttribute('marker-end', markerId);
    
        return line;
    }

    updateMarker(x: number){

        this._marker?.setAttribute('refX', x.toString());

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

