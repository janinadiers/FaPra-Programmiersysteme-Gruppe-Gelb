import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-import-menu',
  templateUrl: './import-menu.component.html',
  styleUrls: ['./import-menu.component.css']
})
export class ImportMenuComponent {

    @Output() importSelected = new EventEmitter<string>();

    selectFileType(fileType: string): void {
        this.importSelected.emit(fileType);
    }
}
