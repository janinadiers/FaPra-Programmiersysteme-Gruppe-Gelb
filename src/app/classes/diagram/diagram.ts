import {Element} from './element';
import {Line} from './line';
import { Place } from './place';
import { Transition } from './transition';

export class Diagram {
    // private readonly _elements: Array<Element>;
    private readonly _places: Array<Place>;
    private readonly _transitions: Array<Transition>;
    private readonly _lines: Array<Line>;
    private readonly _order: Array<string>;

    selectedCircle: SVGElement | undefined = undefined;
    selectedRect: SVGElement | undefined = undefined;
    
    idCircleCount: number = 0;
    idRectCount: number = 0;
    idLineCount: number = 0;
    lightningCount: number = 0;


    constructor(places: Array<Place>, transitions: Array<Transition>, lines?: Array<Line>) {
        this._places = places;
        this._transitions = transitions;
        this._lines = lines ?? [];
        this._order = [];
    }

    get places(): Array<Place> {
        return this._places;
    }

    get transitions(): Array<Transition> {
        return this._transitions;
    }

    get lines(): Array<Line> {
        return this._lines;
    }

    get order(): Array<string> {
        return this._order;
    }

    pushPlace(place: Place): void {
        console.log('pushPlace');
        this._places.push(place);
    }

    pushTransition(transition: Transition): void {
        console.log('pushTransition');
        this._transitions.push(transition);
    }

    pushLine(line: Line): void {
        console.log('pushLine');
        this._lines.push(line);
    }

    pushID(id: string) {
        this._order.push(id);
    }

    clearElements(): void {
        this._places.splice(0, this._places.length);
        this._transitions.splice(0, this._transitions.length);
        this._lines.splice(0, this._lines.length);
    }

    createCircleObject(x: number, y:number){

        // ID String für jeden Kreis um 1 erhöhen (p0, p1,..)
        let idString: string = "p" + this.idCircleCount;
        this.idCircleCount++;
    
        let circleObject = new Place(idString, x, y);
        // Objekt im Array abspeichern
        this.pushPlace(circleObject);
        
        return circleObject;
      }


      createRectObject (x: number, y: number){
    
        // ID String für jedes Rechteck um 1 erhöhen (t0, t1,..)
        let idString: string = "t" + this.idRectCount;
        this.idRectCount++;
    
        let rectObject = new Transition(idString, x, y)
        // Objekt im Array abspeichern
        this.pushTransition(rectObject);
        
        return rectObject;
      }

      createLineObject (source: Element, target: Element){
    
        // ID String für jeden Pfeil/Linie um 1 erhöhen (a0, a1,..)
        let idString: string = "a" + this.idLineCount;
        this.idLineCount++;
        let lineObject = new Line (idString, source, target);
        // Objekt im Array abspeichern
        this.pushLine(lineObject);
        return lineObject;
      }

      resetSelectedElements() {
        this.selectedCircle = undefined;
        this.selectedRect = undefined;
      }
    
      resetCounterVar() {
        this.idCircleCount = 0;
        this.idRectCount = 0;
        this.idLineCount = 0;
        this.lightningCount = 0;
      }










}
