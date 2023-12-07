import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Diagram } from '../classes/diagram/diagram';

@Injectable({
  providedIn: 'root'
})

export class ActivebuttonService {

  isCircleButtonActive: boolean = false;
  isRectangleButtonActive: boolean = false;
  isArrowButtonActive: boolean = false;
  isBoltButtonActive: boolean = false;

    //Observable für Delete-Button und Zoom-Button

private buttonClickSubject = new Subject<string>();
private zoomButtonClickSubject = new Subject<string>();
  
  RectangleButtonActive() {
    this.isCircleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isRectangleButtonActive = !this.isRectangleButtonActive;
    Diagram.drawingIsActive = this.isRectangleButtonActive;
  }
  
  circleButtonActive() {
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = false;
    this.isCircleButtonActive = !this.isCircleButtonActive; 
    Diagram.drawingIsActive = this.isCircleButtonActive; 
  }

  arrowButtonActive() {
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isBoltButtonActive = false;
    this.isArrowButtonActive = !this.isArrowButtonActive;
    Diagram.drawingIsActive = this.isArrowButtonActive;
  }

  boltButtonActive() {
    this.isCircleButtonActive = false;
    this.isRectangleButtonActive = false;
    this.isArrowButtonActive = false;
    this.isBoltButtonActive = !this.isBoltButtonActive;
    Diagram.drawingIsActive = this.isBoltButtonActive;
  }


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