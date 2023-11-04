import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';

@Injectable({
  providedIn: 'root'
})
export class SvgElementService {

  elements: Element[] = [];  
  idCircleCount: number = 0;
  idRectCount: number = 0;
  idArrowCount: number = 0;
  lightningCount: number =0;

  selectedCircle: SVGElement | undefined = undefined;
  selectedRect: SVGElement | undefined = undefined;
 
  addElements(element: Element): void {
    this.elements.push(element);
    console.log(this.elements);
  }

  clearElements(){
    this.elements = [];
  }

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
