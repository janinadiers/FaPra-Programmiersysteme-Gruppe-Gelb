import { JsonExport } from 'src/app/services/json-export.service';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-export-button-json',
    templateUrl: './export-button-json.component.html',
    styleUrls: ['./export-button-json.component.css']
})
export class ExportJsonButtonComponent {

    @Input() title: string | undefined;
    
    constructor(
        private _jsonExport: JsonExport,
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

    exportToJsonFile(e: MouseEvent) {
        
      this.prevent(e);
      this._jsonExport.export();
        
    }

}
