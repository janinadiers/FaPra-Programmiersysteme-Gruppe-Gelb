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

    //Observable für Delete-Button und Zoom-Button

private buttonClickSubject = new Subject<string>();
private zoomButtonClickSubject = new Subject<string>();
  
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

  // zoomInButtonActive() {
   
  //   this.isCircleButtonActive = false;
  //   this.isRectangleButtonActive = false;
  //   this.isArrowButtonActive = false;
  //   this.isBoltButtonActive = false;
  //   this.isZoomOutButtonActive = false;
  //   this.isZoomInButtonActive = !this.isZoomInButtonActive;
  // }

  // zoomOutButtonActive() {
    
  //   this.isCircleButtonActive = false;
  //   this.isRectangleButtonActive = false;
  //   this.isArrowButtonActive = false;
  //   this.isBoltButtonActive = false;
  //   this.isZoomInButtonActive = false;
  //   this.isZoomOutButtonActive = !this.isZoomOutButtonActive;
   
    
  // }

  zoomButtonClick(buttonId: string) {
    this.zoomButtonClickSubject.next(buttonId);
  }
    
  zoomButtonClickObservable() {
    return this.zoomButtonClickSubject.asObservable();
  }

  sendButtonClick(buttonId: string) {
    this.buttonClickSubject.next(buttonId);
  }

  getButtonClickObservable() {
    return this.buttonClickSubject.asObservable();
  }
}