import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';

@Injectable({
  providedIn: 'root'
})
export class SvgElementService {

  circles: Element[] = [];
  rectangles: Element[] = [];
  arrows: Element[] = [];

  idCircleCount: number = 0;
  idRectCount: number = 0;
  idArrowCount: number = 0;
  lightningCount: number =0;

  selectedCircle: SVGElement | undefined = undefined;
  selectedRect: SVGElement | undefined = undefined;


  addCircle(circle: Element): void {
    this.circles.push(circle);
    console.log(this.circles);
  }

  addRectangle(rectangle: Element): void {
    this.rectangles.push(rectangle);
    console.log(this.rectangles);
  }
}
