import { Component } from '@angular/core';
import { ActivebuttonService } from 'src/app/services/activebutton.service';
import { Diagram } from './../../classes/diagram/diagram';
import { DisplayService } from 'src/app/services/display.service';
import { MarkenspielService } from "../../services/markenspiel.service";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  private _diagram: Diagram | undefined;

  constructor(private activeButtonService: ActivebuttonService,
              private _displayService: DisplayService,
              public markenspielService: MarkenspielService
  ) {
  this._displayService.diagram$.subscribe(diagram => {
  this._diagram = diagram;
  });
  }

  rectActiveColor: boolean = false;
  circleActiveColor: boolean = false;
  arrowActiveColor: boolean = false;
  boltActiveColor: boolean = false;

  toggleRectangleButton() {
    this.circleActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = false;
    this.rectActiveColor = !this.rectActiveColor;
    this.activeButtonService.RectangleButtonActive();
  }

  toggleCircleButton() {
    this.rectActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = false;
    this.circleActiveColor = !this.circleActiveColor;
    this.activeButtonService.circleButtonActive();
  }

  toggleArrowButton () {
    this.circleActiveColor = false;
    this.rectActiveColor = false;
    this.boltActiveColor = false;
    this.arrowActiveColor = !this.arrowActiveColor;
    // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
    this._diagram?.resetSelectedElements();
    this.activeButtonService.arrowButtonActive();
  }

  toggleBoltButton () {
    this.circleActiveColor = false;
    this.rectActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = !this.boltActiveColor;
    // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
    this._diagram?.resetSelectedElements();
    this._diagram!.lightningCount = 0;
    this.activeButtonService.boltButtonActive();
  }

  onButtonClick(buttonId: string){
    this.activeButtonService.sendButtonClick(buttonId);
  }

}
