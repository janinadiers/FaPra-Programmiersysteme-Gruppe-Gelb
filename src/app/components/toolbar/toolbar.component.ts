import { Component } from '@angular/core';
import { ActivebuttonService } from 'src/app/services/activebutton.service';
import { SvgElementService } from 'src/app/services/svg-element.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  constructor(private activeButtonService: ActivebuttonService,
              private svgElementService: SvgElementService) { }

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
    // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
    this.svgElementService.selectedCircle = undefined;
    this.svgElementService.selectedRect = undefined;
    this.activeButtonService.arrowButtonActive();
  }

  toggleBoltButton (mouseEvent: MouseEvent) {
    this.circleActiveColor = false;
    this.rectActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = !this.boltActiveColor;
    // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
    this.svgElementService.selectedCircle = undefined;
    this.svgElementService.selectedRect = undefined;
    this.svgElementService.lightningCount = 0;
    this.activeButtonService.boltButtonActive();
  }

}
