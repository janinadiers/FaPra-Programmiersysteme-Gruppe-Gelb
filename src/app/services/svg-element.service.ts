import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';
import { Diagram } from '../classes/diagram/diagram';

@Injectable({
  providedIn: 'root'
})
export class SvgElementService {

  private elements: Array<Element> = [];
  objects = new Diagram (this.elements);

  idCircleCount: number = 0;
  idRectCount: number = 0;
  idArrowCount: number = 0;
  lightningCount: number =0;

  selectedCircle: SVGElement | undefined = undefined;
  selectedRect: SVGElement | undefined = undefined;
 
  resetSelectedElements() {
    this.selectedCircle = undefined;
    this.selectedRect = undefined;
  }

  resetCounterVar() {
    this.idCircleCount = 0;
    this.idRectCount = 0;
    this.idArrowCount = 0;
    this.lightningCount = 0;
  }
}
