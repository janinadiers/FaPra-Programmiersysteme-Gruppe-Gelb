
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
    @Output('fileContent') fileContent: EventEmitter<string>;

    constructor(
        private _fileReaderService: FileReaderService
    ) {
        this.fileContent = new EventEmitter<string>();
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

    prepareImportFromPnmlFile(e: MouseEvent) {
        
      this.prevent(e);
      this.input?.nativeElement.click();
        
    }

    importFromPnmlFile(e: Event) {
        const selectedFile = e.target as HTMLInputElement;
        if (selectedFile.files && selectedFile.files.length > 0) {
            // console.log('selectedFile: ', selectedFile.files[0].name.match(/\.pnml$/));
            // if(selectedFile.files[0].name.match(/\.pnml$/)) {
            //     console.log('PNML file selected');
                
            // }
            this._fileReaderService
                .readFile(selectedFile.files[0])
                .subscribe((content) => {
                    this.fileContent.emit(content);
                });
        }
    }
}
