import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {ActivebuttonService} from 'src/app/services/activebutton.service';
import {DisplayService} from "../../services/display.service";
import {ExportService} from "../../services/export.service";
import {DownloadService} from "../../services/helper/download-service";
import {Diagram} from '../../classes/diagram/diagram';
import {PnmlImportService} from "../../services/pnml-import.service";
import {ParserService} from "../../services/parser.service";
import {FileReaderService} from "../../services/file-reader.service";

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

    private _diagram: Diagram | undefined;

    private readonly PNML_FILE: string = 'petriNetz.pnml';
    private readonly PNML_TYPE: string = 'text/xml';

    private readonly JSON_FILE: string = 'petriNetz.json';
    private readonly JSON_TYPE: string = 'application/json';

    private readonly PNG_FILE: string = 'petriNetz.png';
    private readonly PNG_TYPE: string = 'image/png';

    private readonly SVG_FILE: string = 'petriNetz.svg'
    private readonly SVG_TYPE: string = 'image/svg+xml';

    @ViewChild('hiddenInput') input: ElementRef = new ElementRef(null);
    @Output('fileContent') fileContent: EventEmitter<{fileContent:string, fileExtension:string}>;

    constructor(private _activeButtonService: ActivebuttonService,
                private _exportService: ExportService,
                private _displayService: DisplayService,
                private _downloadService: DownloadService,
                private _pnmlImportService: PnmlImportService,
                private _parserService: ParserService,
                private _fileReaderService: FileReaderService
    ) {
        this._displayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
        });

        this.fileContent = new EventEmitter<{fileContent:string, fileExtension:string}>();
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

    exportPnml(): void {
        const pnmlString = this._exportService.exportAsPNML();
        this._downloadService.downloadFile(pnmlString, this.PNML_FILE, this.PNML_TYPE);
    }

    exportJson(): void {
        const jsonString = this._exportService.exportAsJSON();
        this._downloadService.downloadFile(jsonString, this.JSON_FILE, this.JSON_TYPE);
    }

    exportPng(): void {
        this._exportService.exportAsPNG().then((blob) => {
            console.log(blob);
            this._downloadService.downloadFile(blob, this.PNG_FILE, this.PNG_TYPE);
        }).catch((error) => {
            console.log('Error creating the PNG file', error);
        });
    }

    exportSvg(): void {
        const svgString = this._exportService.exportAsSVG();
        this._downloadService.downloadFile(svgString, this.SVG_FILE, this.SVG_TYPE)
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
                    this.processSourceChange({fileContent: content, fileExtension: fileExtension});
                });
        }
    }

    prepareImportFromFile(e: MouseEvent) {
        this.input?.nativeElement.click();
    }

    public processSourceChange(newSource: {fileContent: string, fileExtension: string}) {
        let result = undefined;

        if (newSource.fileExtension === 'pnml') {
            result = this._pnmlImportService.import(newSource.fileContent);
        } else if (newSource.fileExtension === 'json') {
            result = this._parserService.parse(newSource.fileContent);
        } else {
            alert("Please choose either .pnml or .json");
        }

        if (result !== undefined) {

            this._displayService.display(result);
        }
    }
}
