import { Component } from '@angular/core';
import { ActivebuttonService } from 'src/app/services/activebutton.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  constructor(private activeButtonService: ActivebuttonService) { }

  rectActiveColor: boolean = false;
  circleActiveColor: boolean = false;
  arrowActiveColor: boolean = false;
  boltActiveColor: boolean = false;

  toggleRectangleButton(mouseEvent: MouseEvent) {
    this.circleActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = false;
    this.rectActiveColor = !this.rectActiveColor;
    this.activeButtonService.RectangleButtonActive(); 
  }
  
  
  toggleCircleButton(mouseEvent: MouseEvent) {
    this.rectActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = false;
    this.circleActiveColor = !this.circleActiveColor;
    this.activeButtonService.circleButtonActive(); 
  }


  toggleArrowButton (mouseEvent: MouseEvent) {
    this.circleActiveColor = false;
    this.rectActiveColor = false;
    this.boltActiveColor = false;
    this.arrowActiveColor = !this.arrowActiveColor;
    this.activeButtonService.arrowButtonActive();
  }

  toggleBoltButton (mouseEvent: MouseEvent) {
    this.circleActiveColor = false;
    this.rectActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = !this.boltActiveColor;
    this.activeButtonService.boltButtonActive();

  }

}
