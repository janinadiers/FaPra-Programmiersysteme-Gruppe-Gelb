import { Element } from 'src/app/classes/diagram/element';
import { Coords } from '../json-petri-net';

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
        this._sourcePosition = {x: source.x, y: source.y};
        this._targetPosition = {x: target.x, y: target.y};
        
        
        source.getPositionChangeObservable().subscribe((source) => {
            this.updateSource({x: source.x, y: source.y});
            
        });
        target.getPositionChangeObservable().subscribe((target) => {
            this.updateTarget({x: target.x, y: target.y});
           
        
        });
    }

    get id(): string {
        return this._id;
    }

    get source(): Element | undefined {
        return this._source;
    }


    get target(): Element| undefined {
        return this._target;
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
        
        if(this._svgElement) {
            this._svgElement.setAttribute('points', (`${updatedPosition.x},${updatedPosition.y} ${this.getCoordsString()}${this._targetPosition?.x},${this._targetPosition?.y}`));
            this._sourcePosition = {x: updatedPosition.x, y: updatedPosition.y};
        }

        

    }

    private updateTarget(updatedPosition: Coords): void {
        
        if(this._svgElement) {
            this._svgElement.setAttribute('points', (`${this._sourcePosition?.x},${this._sourcePosition?.y} ${this.getCoordsString()}${updatedPosition.x},${updatedPosition.y}`));
            this._targetPosition = {x: updatedPosition.x, y: updatedPosition.y};
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

