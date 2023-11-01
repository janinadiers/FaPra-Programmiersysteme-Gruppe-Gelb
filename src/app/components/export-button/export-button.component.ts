import { PnmlExport } from 'src/app/services/pnml-export.service';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-export-button',
    templateUrl: './export-button.component.html',
    styleUrls: ['./export-button.component.css']
})
export class ExportButtonComponent {

    @Input() title: string | undefined;
    
    constructor(
        private _pnmlExport: PnmlExport,
    ) {}

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

    exportToPnmlFile(e: MouseEvent) {
        
      this.prevent(e);
      this._pnmlExport.export();
        
    }

}
