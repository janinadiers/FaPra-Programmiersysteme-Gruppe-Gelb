import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';
import { Diagram } from '../classes/diagram/diagram';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import { Line } from '../classes/diagram/line';


@Injectable({
  providedIn: 'root'
})
export class SvgElementService {
 
  private elements: Array<Element> = [];
  // Das Diagram sollte nur einmal erstellt werden (wird aktuell im Displayservice gemacht), da es sonst zu Problemen mit den imports/exports kommt
  // die Elemente werden jetzt im display.component.ts file direkt dem Diagram duch pushElement hinzugefügt
  // shapes = new Diagram (this.elements);

  selectedCircle: SVGElement | undefined = undefined;
  selectedRect: SVGElement | undefined = undefined;
 
  idCircleCount: number = 0;
  idRectCount: number = 0;
  idLineCount: number = 0;
  lightningCount: number =0;


  createCircleObject(x: number, y:number){

    // ID String für jeden Kreis um 1 erhöhen (p0, p1,..)
    let idString: string = "p" + this.idCircleCount;
    this.idCircleCount++;

    let circleObject = new Place(idString, x, y);
    // Objekt im Array abspeichern
    //this.shapes.pushElement(circleObject);
  
    return circleObject;
  }


  createRectObject (x: number, y: number){

    // ID String für jedes Rechteck um 1 erhöhen (t0, t1,..)
    let idString: string = "t" + this.idRectCount;
    this.idRectCount++;

    let rectObject = new Transition(idString, x, y)
    // Objekt im Array abspeichern
    //this.shapes.pushElement(rectObject);
    
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
  
}
