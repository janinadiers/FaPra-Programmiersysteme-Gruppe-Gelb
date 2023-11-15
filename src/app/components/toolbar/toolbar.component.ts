import {Component} from '@angular/core';
import {ActivebuttonService} from 'src/app/services/activebutton.service';
import {SvgElementService} from 'src/app/services/svg-element.service';
import {PnmlExport} from "../../services/pnml-export.service";
import {JsonExport} from "../../services/json-export.service";
import {PngExportService} from "../../services/png-export.service";
import {SvgService} from "../../services/svg.service";
import {DisplayService} from "../../services/display.service";

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

    constructor(private activeButtonService: ActivebuttonService,
                private svgElementService: SvgElementService,
                private pnmlExportService: PnmlExport,
                private jsonExportService: JsonExport,
                private pngExportService: PngExportService,
                private svgExportService: SvgService,
                private displayService: DisplayService,
                //private downloadService: DownloadService
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
        this.pnmlExportService.export();
    }

    exportJson(): void {
        this.jsonExportService.export();
    }

    exportPng(): void {
        this.pngExportService.createPngFile();
    }

    exportSvg(): void {
        this.svgExportService.exportToSvg(this.displayService.diagram?.elements);
    }
}
