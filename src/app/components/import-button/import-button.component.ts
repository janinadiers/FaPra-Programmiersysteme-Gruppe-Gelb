
import {
    Component,
    Input,
    ViewChild,
    ElementRef,
    EventEmitter,
    Output,
} from '@angular/core';
import { FileReaderService } from '../../services/file-reader.service';

@Component({
    selector: 'app-import-button',
    templateUrl: './import-button.component.html',
    styleUrls: ['./import-button.component.css']
})
export class ImportButtonComponent {

    @Input() title: string | undefined;
    @ViewChild('hiddenInput') input: ElementRef = new ElementRef(null);
    @Output('fileContent') fileContent: EventEmitter<{fileContent:string, fileExtension:string}>;

    constructor(
        private _fileReaderService: FileReaderService
    ) {
        this.fileContent = new EventEmitter<{fileContent:string, fileExtension:string}>();
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

    prepareImportFromFile(e: MouseEvent) {
        
      this.prevent(e);
      this.input?.nativeElement.click();
        
    }

    importFromFile(e: Event) {
        const selectedFile = e.target as HTMLInputElement;
        if (selectedFile.files && selectedFile.files.length > 0) {
            var fileExtension = selectedFile.files[0].name.match(/\.pnml$/) ? 'pnml' : '';
            if (fileExtension.length == 0)
                fileExtension = selectedFile.files[0].name.match(/\.json$/) ? 'json' : '';
            this._fileReaderService
                .readFile(selectedFile.files[0])
                .subscribe((content) => {
                    this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
                });
        }
    }
}
