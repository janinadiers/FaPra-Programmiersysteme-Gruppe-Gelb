import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {ActivebuttonService} from 'src/app/services/activebutton.service';
import {DisplayService} from "../../services/display.service";
import {DownloadService} from "../../services/helper/download-service";
import {Diagram} from '../../classes/diagram/diagram';
import {FileReaderService} from "../../services/file-reader.service";
import {AppComponent} from "../../app.component";
import {PnmlExportService} from "../../services/export/pnml-export.service";
import {JsonExportService} from "../../services/export/json-export.service";
import {PngExportService} from "../../services/export/png-export.service";
import {SvgService} from "../../services/svg.service";
import {MarkenspielService} from "../../services/markenspiel.service";

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

    private _diagram: Diagram | undefined;

    @ViewChild('hiddenInput') input: ElementRef = new ElementRef(null);
    @Output('fileContent') fileContent: EventEmitter<{ fileContent: string, fileExtension: string }>;

    constructor(private _activeButtonService: ActivebuttonService,
                private _displayService: DisplayService,
                private _downloadService: DownloadService,
                private _fileReaderService: FileReaderService,
                private _appComponent: AppComponent,
                private _pnmlExportService: PnmlExportService,
                private _jsonExportService: JsonExportService,
                private _pngExportService: PngExportService,
                private _svgExportService: SvgService,
                public _markenspielService: MarkenspielService
    ) {
        this._displayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
        });

        this.fileContent = new EventEmitter<{ fileContent: string, fileExtension: string }>();
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
        this._activeButtonService.RectangleButtonActive();
    }

    toggleCircleButton() {
        this.rectActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor = false;
        this.circleActiveColor = !this.circleActiveColor;
        this._activeButtonService.circleButtonActive();
    }

    toggleArrowButton() {
        this.circleActiveColor = false;
        this.rectActiveColor = false;
        this.boltActiveColor = false;
        this.arrowActiveColor = !this.arrowActiveColor;
        // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
        this._diagram?.resetSelectedElements();
        this._activeButtonService.arrowButtonActive();
    }

    toggleBoltButton() {
        this.circleActiveColor = false;
        this.rectActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor = !this.boltActiveColor;
        // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
        this._diagram?.resetSelectedElements();
        this._diagram!.lightningCount = 0;
        this._activeButtonService.boltButtonActive();
    }

    onButtonClick(buttonId: string) {
        this._activeButtonService.sendButtonClick(buttonId);
    }

    export(fileType: string): void {
        let exportContent;
        switch (fileType) {
            case 'PNML':
                exportContent = this._pnmlExportService.export();
                this._downloadService.downloadFile(exportContent, this.PNML_FILE, this.PNML_TYPE);
                break;
            case 'JSON':
                exportContent = this._jsonExportService.export();
                this._downloadService.downloadFile(exportContent, this.JSON_FILE, this.JSON_TYPE);
                break;
            case 'PNG':
                this._pngExportService.export().then((blob) => {
                    console.log(blob);
                    this._downloadService.downloadFile(blob, this.PNG_FILE, this.PNG_TYPE);
                }).catch((error) => {
                    console.log('Error during creating the PNG file', error);
                    alert('Error during creating the PNG file');
                });
                break;
            case 'SVG':
                exportContent = this._svgExportService.export();
                this._downloadService.downloadFile(exportContent, this.SVG_FILE, this.SVG_TYPE);
                break;
            default:
                console.log('Unknown file format.');
                alert('An error occurred during export. Unknown file format.')
        }
    }

    /**
     * ToDo: Not happy with this
     * @param fileType
     */
    prepareImportFromFile(fileType: string): void {
        // Implement your logic for importing based on fileType
        console.log(`Preparing to import ${fileType}`);
        this.input?.nativeElement.click();
    }

    /**
     * ToDo: Not happy with this
     * @param event
     */
    importFromFile(e: Event): void {
        const selectedFile = e.target as HTMLInputElement;
        if (selectedFile.files && selectedFile.files.length > 0) {
            var fileExtension = selectedFile.files[0].name.match(/\.pnml$/) ? 'pnml' : '';
            if (fileExtension.length == 0)
                fileExtension = selectedFile.files[0].name.match(/\.json$/) ? 'json' : '';
            this._fileReaderService
                .readFile(selectedFile.files[0])
                .subscribe((content) => {
                    this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
                    this._appComponent.processSourceChange({fileContent: content, fileExtension: fileExtension});
                });
        }
    }

    onZoomButtonClick(id: string) {
        this._activeButtonService.zoomButtonClick(id);
    }
}
