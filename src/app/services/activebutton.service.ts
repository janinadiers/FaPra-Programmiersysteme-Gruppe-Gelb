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

  //Observable für Delete-Button

  private buttonClickSubject = new Subject<string>();

  sendButtonClick(buttonId: string) {
    this.buttonClickSubject.next(buttonId);
  }

  getButtonClickObservable() {
    return this.buttonClickSubject.asObservable();
  }


}