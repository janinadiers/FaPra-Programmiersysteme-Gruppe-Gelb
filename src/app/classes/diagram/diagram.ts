import {Element} from './element';
import { Line } from './line';
import { Place } from './place';
import { Transition } from './transition';

export class Diagram {
    private readonly _elements: Array<Element>;
   
    selectedCircle: SVGElement | undefined = undefined;
    selectedRect: SVGElement | undefined = undefined;
    
    idCircleCount: number = 0;
    idRectCount: number = 0;
    idLineCount: number = 0;
    lightningCount: number =0;

    constructor(elements: Array<Element>) {
        this._elements = elements;
    }

    get elements(): Array<Element> {
        return this._elements;
    }

    pushElement(element: Element): void {
       
        this._elements.push(element);
    }

    createCircleObject(x: number, y:number){

        // ID String für jeden Kreis um 1 erhöhen (p0, p1,..)
        let idString: string = "p" + this.idCircleCount;
        this.idCircleCount++;
    
        let circleObject = new Place(idString, x, y);
        // Objekt im Array abspeichern
        this.pushElement(circleObject);
        
        return circleObject;
      }
    
    
      createRectObject (x: number, y: number){
    
        // ID String für jedes Rechteck um 1 erhöhen (t0, t1,..)
        let idString: string = "t" + this.idRectCount;
        this.idRectCount++;
    
        let rectObject = new Transition(idString, x, y)
        // Objekt im Array abspeichern
        this.pushElement(rectObject);
        
        return rectObject;
      }
    
      createLineObject (source: Element, target: Element){
    
        // ID String für jeden Pfeil/Linie um 1 erhöhen (a0, a1,..)
        let idString: string = "a" + this.idLineCount;
        this.idLineCount++;
        let lineObject = new Line (idString, source, target);
        // Objekt im Array abspeichern
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

    clearElements(): void {
        this._elements.splice(0, this._elements.length);
    }
}
