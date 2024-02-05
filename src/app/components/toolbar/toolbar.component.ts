import {Component, ElementRef, EventEmitter, Output, Input, ViewChild} from '@angular/core';
import {ActivebuttonService} from 'src/app/services/activebutton.service';
import {DisplayService} from "../../services/display.service";
import {DownloadService} from "../../services/helper/download-service";
import {Diagram} from '../../classes/diagram/diagram';
import {FileReaderService} from "../../services/file-reader.service";
import {AppComponent} from "../../app.component";
import {PnmlExportService} from "../../services/export/pnml-export.service";
import {JsonExportService} from "../../services/export/json-export.service";
import {PngExportService} from "../../services/export/png-export.service";
import {SvgService} from "../../services/export/svg.service";
import {MarkenspielService} from "../../services/markenspiel.service";
import {SpringEmbedderService} from "../../services/spring-embedder.service";
import {DrawingService} from "../../services/drawing.service";
import { FreiAlgorithmusService } from 'src/app/services/frei-algorithmus.service';

import {transition} from "@angular/animations";
import {Transition} from "../../classes/diagram/transition";

import {SugiyamaService} from "../../services/sugiyama.service";

import {template} from "lodash";

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
                public _markenspielService: MarkenspielService,
                private _springEmbedderService: SpringEmbedderService,
                private _freiAlgorithmusService: FreiAlgorithmusService,
                private _drawingService: DrawingService,
                private _sugiyamaService: SugiyamaService
    ) {
        this._displayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
            this.onAlgorithmSelect();
        });

        this.fileContent = new EventEmitter<{ fileContent: string, fileExtension: string }>();


    }

    rectActiveColor: boolean = false;
    circleActiveColor: boolean = false;
    arrowActiveColor: boolean = false;
    boltActiveColor: boolean = false;
    simulationActive: boolean = false;
    reachabilityActiveColor: boolean = false;
    simulationStatus: number = 0;
    initialState: Map<string, number> = new Map<string, number>();
    pdfSrc: string = 'assets/manual.pdf';
    stepsActive: boolean = false;
    multitasking: boolean = false;
    randomStep: boolean = false;

    ngOnInit() {
        this.simulationStatus = 0;
        this._drawingService.setSimulationStatus(this.simulationStatus);

        this._diagram?.transitions.forEach((transition) => {
            this._markenspielService.setTransitionColor(transition, 'black');
            transition.isActive = false;
        });

        this.onAlgorithmSelect();

    }

    toggleRectangleButton() {
        if(this.reachabilityActiveColor){
            return;
        }
        this.circleActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor = false;
        this.rectActiveColor = !this.rectActiveColor;
        this._activeButtonService.RectangleButtonActive();
        this._drawingService.deselectPlacesAndLines();
        this.deselectAddAndRemoveTokenButtons();

    }

    toggleCircleButton() {
        if(this.reachabilityActiveColor){
            return;
        }
        this.rectActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor = false;
        this.circleActiveColor = !this.circleActiveColor;
        this._activeButtonService.circleButtonActive();
        this._drawingService.deselectPlacesAndLines();
        this.deselectAddAndRemoveTokenButtons();
    }

    toggleArrowButton() {
        if(this.reachabilityActiveColor){
            return;
        }
        this.circleActiveColor = false;
        this.rectActiveColor = false;
        this.boltActiveColor = false;
        this.arrowActiveColor = !this.arrowActiveColor;
        // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
        this._diagram?.resetSelectedElements();
        this._activeButtonService.arrowButtonActive();
        this._drawingService.deselectPlacesAndLines();
        this.deselectAddAndRemoveTokenButtons();
    }

    toggleBoltButton() {
        if(this.reachabilityActiveColor){
            return;
        }
        this.circleActiveColor = false;
        this.rectActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor = !this.boltActiveColor;
        // Bei Betätigung des Buttons werden selektierte SVG Elemente zurückgesetzt
        this._diagram?.resetSelectedElements();
        this._diagram!.lightningCount = 0;
        this._activeButtonService.boltButtonActive();
        this._drawingService.deselectPlacesAndLines();
        this.deselectAddAndRemoveTokenButtons();
    }

    toggleReachabilityButton(){
        this.circleActiveColor = false;
        this.rectActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor =  false;
        this.reachabilityActiveColor = !this.reachabilityActiveColor;
        if(this.simulationActive == false){
            this._drawingService.deselectPlacesAndLines();
            this.deselectAddAndRemoveTokenButtons();
        }

    }


    onAlgorithmSelect(algorithm:string = 'free') {
        if (this._diagram == undefined)
            return;

        const freeButton = document.querySelector('.free') as HTMLElement;
        const springEmbedderButton = document.querySelector('.spring-embedder') as HTMLElement;
        const sugiyamaButton = document.querySelector('.sugiyama') as HTMLElement;


        this._activeButtonService.deactivateAllButtons();
        this.deselectActiveColors();
        if(algorithm === 'spring-embedder'){
            if(freeButton && springEmbedderButton && sugiyamaButton && this._diagram?.nodes && this._diagram.nodes.length > 0){
                springEmbedderButton.classList.add('selected');
                freeButton.classList?.remove('selected');
                sugiyamaButton.classList?.remove('selected');
            }
            this._freiAlgorithmusService.start()
            this._springEmbedderService.start()

        }

        else if(algorithm === 'sugiyama'){
            if(freeButton && springEmbedderButton && sugiyamaButton && this._diagram?.nodes && this._diagram.nodes.length > 0){
                sugiyamaButton.classList.add('selected');
                freeButton.classList?.remove('selected');
                springEmbedderButton.classList?.remove('selected');
            }

            this._springEmbedderService.teardown();
            this._sugiyamaService.begin(this._diagram);

        }
        else{
            if(freeButton && springEmbedderButton && sugiyamaButton && this._diagram?.nodes && this._diagram.nodes.length > 0){
                freeButton.classList.add('selected');
                springEmbedderButton.classList?.remove('selected');
                sugiyamaButton.classList?.remove('selected');
            }
            this._springEmbedderService.teardown();
            this._freiAlgorithmusService.start()
        }

    }

    deselectActiveColors() {
        this.rectActiveColor = false;
        this.circleActiveColor = false;
        this.arrowActiveColor = false;
        this.boltActiveColor = false;
    }

    addToken() {

        if (Diagram.drawingIsActive) {
            return
        }
        let addTokenButton = document.querySelector('.add-token > mat-icon') as HTMLElement;

        if (addTokenButton.style.color == 'red') {
            this._markenspielService.addCircleToken();

        } else if (addTokenButton.style.color == 'blue') {
            this._markenspielService.addLineToken();

        }

    }

    onButtonClick(buttonId: string) {
        if (buttonId === "reachabilityGraph"){
            if(this.checkValidity()){
            this.toggleReachabilityButton();
            this._activeButtonService.reachabilityButtonActive();
            this._activeButtonService.sendButtonClick(buttonId);
            }
            else{
                alert("Please provide a petri net with marks!");
            }
        }
        else{
            this._activeButtonService.sendButtonClick(buttonId);
        }


    }

    checkValidity(){

        if (this._diagram?.places.some(place => place.amountToken > 0)) {
            return true;
          }

        else{
            return false;
        }

    }

    removeToken(){

        if(Diagram.drawingIsActive){
            return
        }
        let addTokenButton = document.querySelector('.add-token > mat-icon') as HTMLElement;
        if(addTokenButton.style.color == 'red'){
            this._markenspielService.removeCircleToken();
        }
        else if(addTokenButton.style.color == 'blue'){
            this._markenspielService.removeLineToken();
        }

    }



    export(fileType: string): void {
        let exportContent;
        this._drawingService.deselectPlacesAndLines();
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

    prepareImportFromFile(fileType: string): void {

        this.input?.nativeElement.click();
    }

    importFromFile(e:any): void {

        const selectedFile = e.target as HTMLInputElement;
        if (selectedFile.files && selectedFile.files.length > 0) {
            var fileExtension = selectedFile.files[0].name.toLowerCase().match(/\.pnml$/) ? 'pnml' : '';
            if (fileExtension.length == 0)
                fileExtension = selectedFile.files[0].name.toLowerCase().match(/\.json$/) ? 'json' : '';
            this._fileReaderService
                .readFile(selectedFile.files[0])
                .subscribe((content) => {
                    this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
                    this._appComponent.processSourceChange({fileContent: content, fileExtension: fileExtension});
                });
        }
        e.target!.value = '';
    }

    onZoomButtonClick(id: string) {
        this._activeButtonService.zoomButtonClick(id);
    }

    deselectAddAndRemoveTokenButtons(){
        let addTokenButton = document.querySelector('.add-token > mat-icon') as HTMLElement;
        let removeTokenButton = document.querySelector('.remove-token > mat-icon') as HTMLElement;
        removeTokenButton!.style.color = 'black';
        addTokenButton!.style.color = 'black';
    }

    markenspielText() {
        if(this.stepsActive) {
            return "Markenspiel mit Schritten";
        } else
            return "Markenspiel";
    }

    toggleSimulation() {

        if(this._drawingService.getSimulationStatus() === 0){

            this.getInitialState(); // Initale Markierung speichern
        }
        this.stepsActive = false;
        this.simulationActive = true;
        this._drawingService.drawingActive = false;
        this._markenspielService.processChosing = false;
        this.randomStep = false;
        this._freiAlgorithmusService.disabled = true;
        this.multitasking = false;

        let simulationButton = document.querySelector('.play-button > mat-icon') as HTMLElement;
        let editButton = document.querySelector('.edit-button > mat-icon') as HTMLElement;
        let mergeButton = document.querySelector('.merge-type-button > mat-icon') as HTMLElement;
        let fireButton = document.querySelector('.fire-step-button > mat-icon') as HTMLElement;
        let multiButton = document.querySelector('.multitasking > mat-icon') as HTMLElement;

        simulationButton.style.color = 'green';

        if(multiButton != null){
            multiButton.style.color = 'gray';
        }
        if(editButton != null) {
            editButton.style.color = 'black';
        }
        if(mergeButton != null) {
            mergeButton.style.color = 'black';
        }
        if(fireButton != null) {
            fireButton.style.color = 'gray';
        }

        this._drawingService.deselectPlacesAndLines();
        this._drawingService.setSimulationStatus(1);
        this._markenspielService.multitaskingTransitions(false);

        const startTransitions = this._markenspielService.getPossibleActiveTransitions();
        startTransitions.forEach((transition) => {
            this._markenspielService.setTransitionColor(transition, 'green');
        });
    }

    editStep() {
        this.stepsActive = true;
        this._drawingService.drawingActive = false;
        this._drawingService.setSimulationStatus(2);
        this._markenspielService.processChosing = true;
        this.randomStep = false;
        this.multitasking = false;

        let editButton = document.querySelector('.edit-button > mat-icon') as HTMLElement;
        let playButton = document.querySelector('.play-button > mat-icon') as HTMLElement;
        let mergeButton = document.querySelector('.merge-type-button > mat-icon') as HTMLElement;
        let fireButton = document.querySelector('.fire-step-button > mat-icon') as HTMLElement;
        let multiButton = document.querySelector('.multitasking > mat-icon') as HTMLElement;

        editButton.style.color = 'violet';
        playButton.style.color = 'black';
        fireButton.style.color = 'black';
        if(multiButton) {
            multiButton.style.color = 'black';
        }
        if(this.multitasking == false){
            mergeButton.style.color = 'black';
        } else {
            mergeButton.style.color = 'gray';
        }

        this._markenspielService.multitaskingTransitions(this.multitasking);
        this._markenspielService.editStep();
    }

    showRandomMaximumStep() {
        this.stepsActive = true;
        this._drawingService.drawingActive = false;
        this._drawingService.setSimulationStatus(2);
        this._markenspielService.processChosing = false;
        this.randomStep = true;

        let mergeButton = document.querySelector('.merge-type-button > mat-icon') as HTMLElement;
        let editButton = document.querySelector('.edit-button > mat-icon') as HTMLElement;
        let playButton =  document.querySelector('.play-button > mat-icon') as HTMLElement;
        let fireButton = document.querySelector('.fire-step-button > mat-icon') as HTMLElement;

        mergeButton.style.color = 'violet';
        editButton.style.color = 'black';
        playButton.style.color = 'black';
        fireButton.style.color = 'black';

        this._markenspielService.multitaskingTransitions(false);
        this._markenspielService.random(this.randomStep);
        this._markenspielService.showStep();
    }

    fireStep() {
        let mergeButton = document.querySelector('.merge-type-button > mat-icon') as HTMLElement;
        let doubleCheck = document.querySelector('.multitasking > mat-icon') as HTMLElement;

        this._markenspielService.fireStep();

        if(this.randomStep == true){
            this._markenspielService.showStep();
            mergeButton.style.color = 'violet';
        } else {
            this._markenspielService.editStep();
            if(this.multitasking == true){
                mergeButton.style.color = 'gray';
            } else {
                mergeButton.style.color = 'black';
            }
        }

        if(this.multitasking && doubleCheck){
            doubleCheck.style.color = 'orange';
        }
    }

    openPdf() {

        window.open(this.pdfSrc, '_blank');
      }

    activateMultitaskingTransitions() {
        this.multitasking = !this.multitasking;
        this._markenspielService.multitaskingTransitions(this.multitasking);

        let refreshButton = document.querySelector('.multitasking > mat-icon') as HTMLElement;
        let randomButton = document.querySelector('.merge-type-button > mat-icon') as HTMLElement;


        if(this.multitasking && this.stepsActive) {
            refreshButton.style.color = 'orange';
            randomButton.style.color = 'gray'
        } else {
            refreshButton.style.color = 'black';
            randomButton.style.color = 'black'
        }
    }

    returnToDrawing() {
        this.simulationActive = false;
        this.stepsActive = false;
        this._drawingService.drawingActive = true;
        this._drawingService.setSimulationStatus(0);
        this._markenspielService.multitaskingTransitions(false);
        this._markenspielService.processChosing = false;
        this._freiAlgorithmusService.disabled = false;

        let playButton = document.querySelector('.play-button > mat-icon') as HTMLElement;

        playButton.style.color = 'black';

        this._diagram?.transitions.forEach((transition) => {
            this._markenspielService.setTransitionColor(transition, 'black');
            transition.isActive = false;
        });
        this.setInitialState(); // Initale Markierung setzen
    }

    getInitialState(){
    
        this._diagram?.places.forEach(place => {
            this.initialState.set(place.id, place.amountToken);
            });
    }

    setInitialState(){

        this._diagram?.places.forEach(place => {
           let token = this.initialState.get(place.id);
           place.amountToken = token!;
           if(place.amountToken === 0){
            place.svgElement!.children[1].textContent = null;
           }
           else{
            place.svgElement!.children[1].textContent = 
            place.amountToken.toString();
           }
        });
    }
}
