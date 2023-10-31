import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ActivebuttonService {

  isCircleButtonActive: boolean = false;
  isRectangleButtonActive: boolean = false;
  isArrowButtonActive: boolean = false;
  isBoltButtonActive: boolean = false;
  
  RectangleButtonActive() {
    this.isCircleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isRectangleButtonActive = !this.isRectangleButtonActive;
  }
  
  circleButtonActive() {
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isCircleButtonActive = !this.isCircleButtonActive;  
  }

  arrowButtonActive() {
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isBoltButtonActive = false;
    this.isArrowButtonActive = !this.isArrowButtonActive;
  }

  boltButtonActive() {
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = !this.isBoltButtonActive;
  }
}