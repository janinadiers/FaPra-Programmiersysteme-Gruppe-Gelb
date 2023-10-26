import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';

@Injectable({
  providedIn: 'root'
})
export class SvgElementService {

  circles: Element[] = [];
  rectangles: Element[] = [];
  arrows: Element[] = [];

  
  addCircle(circle: Element): void {
    this.circles.push(circle);
    console.log(this.circles);
  }

  getCircleByIndex(index: number): Element | undefined {
    return this.circles[index];
  }
  
  addRectangle(rectangle: Element): void {
    this.rectangles.push(rectangle);
    console.log(this.rectangles);
  }


}
