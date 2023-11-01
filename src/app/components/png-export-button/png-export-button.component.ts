import { Component, Input } from '@angular/core';
import {PngExportService} from "../../services/png-export.service";

@Component({
  selector: 'app-png-export-button',
  templateUrl: './png-export-button.component.html',
  styleUrls: ['./png-export-button.component.css']
})
export class PngExportButtonComponent {
    @Input() title: string | undefined;

    constructor(
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
    }

}
