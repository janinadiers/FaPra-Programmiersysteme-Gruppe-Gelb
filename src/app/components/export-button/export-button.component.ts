import { Component, Input } from '@angular/core';
import { DisplayService } from "../../services/display.service";
import { PngExportService } from "../../services/png-export.service";

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.css']
})
export class ExportButtonComponent {
    public static readonly META_DATA_CODE = 'drag-file-location';

    @Input() title: string | undefined;

    constructor(
        private _displayService: DisplayService,
        private _pngExport: PngExportService,
        ) {
    }

    prevent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    hoverStart(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.add('mouse-hover');
    }

    hoverEnd(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.remove('mouse-hover');
    }

    processMouseClick(e: MouseEvent) {
        console.log(`Template button "${this.title}" clicked`, e);
        this._pngExport.createPngFile();
        // this._pngExport.createPng2();
    }
}
