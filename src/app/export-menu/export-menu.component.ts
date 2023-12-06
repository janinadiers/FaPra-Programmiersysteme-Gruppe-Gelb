import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-export-menu',
  templateUrl: './export-menu.component.html',
  styleUrls: ['./export-menu.component.css']
})
export class ExportMenuComponent {

    @Output() exportSelected = new EventEmitter<string>();

    selectFileType(fileType: string): void {
        this.exportSelected.emit(fileType);
    }
}
