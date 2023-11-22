import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ActivebuttonService {

  isCircleButtonActive: boolean = false;
  isRectangleButtonActive: boolean = false;
  isArrowButtonActive: boolean = false;
  isBoltButtonActive: boolean = false;
  isZoomInButtonActive: boolean = false;
  isZoomOutButtonActive: boolean = false;

  private zoomButtonClickSubject = new Subject<string>();

zoomButtonClick(buttonId: string) {
  this.zoomButtonClickSubject.next(buttonId);
}

zoomClickObservable() {
  return this.zoomButtonClickSubject.asObservable();
}
  
  RectangleButtonActive() {
    this.isCircleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isZoomInButtonActive = false;
    this.isZoomOutButtonActive = false;
    this.isRectangleButtonActive = !this.isRectangleButtonActive;
  }
  
  circleButtonActive() {
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isZoomInButtonActive = false;
    this.isZoomOutButtonActive = false;
    this.isCircleButtonActive = !this.isCircleButtonActive;  
  }

  arrowButtonActive() {
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isBoltButtonActive = false;
    this.isZoomInButtonActive = false;
    this.isZoomOutButtonActive = false;
    this.isArrowButtonActive = !this.isArrowButtonActive;
  }

  boltButtonActive() {
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isZoomInButtonActive = false;
    this.isZoomOutButtonActive = false;
    this.isBoltButtonActive = !this.isBoltButtonActive;
  }

  zoomInButtonActive() {
    console.log("zoomInButtonActive");
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isZoomOutButtonActive = false;
    this.isZoomInButtonActive = !this.isZoomInButtonActive;
  }

  zoomOutButtonActive() {
    console.log("zoomOutButtonActive");
    
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isZoomInButtonActive = false;
    this.isZoomOutButtonActive = !this.isZoomOutButtonActive;
   
    
  }
}