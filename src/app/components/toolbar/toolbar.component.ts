import {Component} from '@angular/core';
import {ActivebuttonService} from 'src/app/services/activebutton.service';
import {SvgElementService} from 'src/app/services/svg-element.service';
import {DisplayService} from "../../services/display.service";
import {ExportService} from "../../services/export.service";
import {DownloadService} from "../../services/helper/download-service";

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

    private readonly PNML_FILE: string = 'petriNetz.pnml';
    private readonly PNML_TYPE: string = 'text/xml';

    private readonly JSON_FILE: string = 'petriNetz.json';
    private readonly JSON_TYPE: string = 'application/json';

    private readonly PNG_FILE: string = 'petriNetz.png';
    private readonly PNG_TYPE: string = 'image/png';

    private readonly SVG_FILE: string = 'petriNetz.svg'
    private readonly SVG_TYPE: string = 'image/svg+xml';

    constructor(private activeButtonService: ActivebuttonService,
                private svgElementService: SvgElementService,
                private exportService: ExportService,
                private displayService: DisplayService,
                private downloadService: DownloadService
                ) {
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
    this.svgElementService.resetSelectedElements();
    this.activeButtonService.arrowButtonActive();
  }

  toggleBoltButton () {
    this.circleActiveColor = false;
    this.rectActiveColor = false;
    this.arrowActiveColor = false;
    this.boltActiveColor = !this.boltActiveColor;
    // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
    this.svgElementService.resetSelectedElements();
    this.svgElementService.lightningCount = 0;
    this.activeButtonService.boltButtonActive();
  }

    exportPnml(): void {
        const pnmlString = this.exportService.exportAsPNML();
        this.downloadService.downloadFile(pnmlString, this.PNML_FILE, this.PNML_TYPE);
    }

    exportJson(): void {
      const jsonString = this.exportService.exportAsJSON();
      this.downloadService.downloadFile(jsonString, this.JSON_FILE, this.JSON_TYPE);
    }

    exportPng(): void {
      this.exportService.exportAsPNG().then((blob) => {
          console.log(blob);
          this.downloadService.downloadFile(blob, this.PNG_FILE, this.PNG_TYPE);
      }).catch((error) => {
          console.log('Error creating the PNG file', error);
      });
    }

    exportSvg(): void {
        const svgString = this.exportService.exportAsSVG();
        this.downloadService.downloadFile(svgString, this.SVG_FILE, this.SVG_TYPE)
    }
}
