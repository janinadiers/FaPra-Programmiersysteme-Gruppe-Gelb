import {Component, ElementRef, EventEmitter, OnDestroy, Output, OnInit, ViewChild} from '@angular/core';
import {DisplayService} from '../../services/display.service';
import {catchError, of, Subscription, take} from 'rxjs';
import {SvgService} from '../../services/svg.service';
import {Diagram} from '../../classes/diagram/diagram';
import {ExampleFileComponent} from "../example-file/example-file.component";
import {FileReaderService} from "../../services/file-reader.service";
import {HttpClient} from "@angular/common/http";
import { ActivebuttonService } from 'src/app/services/activebutton.service';


@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit, OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileContent') fileContent: EventEmitter<{fileContent:string, fileExtension:string}>;

    private subscriptionOfToolbar: Subscription = new Subscription;
    private _sub: Subscription;
    private _diagram: Diagram | undefined;
    // 
    public zoomFactor: number = 1;
    

    constructor(private _svgService: SvgService,
                private _displayService: DisplayService,
                private _fileReaderService: FileReaderService,
                private _http: HttpClient,
                private activeButtonService: ActivebuttonService) {

        this.fileContent = new EventEmitter<{fileContent:string, fileExtension:string}>();

        this._sub  = this._displayService.diagram$.subscribe(diagram => {
        
        this._diagram = diagram;
        this.draw();
        
        });

        this.activeButtonService.zoomButtonClickObservable().subscribe(buttonId => {
          
            
            if(buttonId === "zoom-in"){
                this.zoomFactor = this.zoomFactor - 0.1;
              
                
            }
            else if(buttonId === "zoom-out"){
               this.zoomFactor = this.zoomFactor + 0.1;
               
               
                
            }
        });
    }

    ngOnInit() {
        this.subscriptionOfToolbar = 
        this.activeButtonService.getButtonClickObservable().subscribe((buttonId: string) => {
        if (buttonId === "clear"){
            let clearElements: boolean = true;
            this.clearDrawingArea(clearElements);
        } 
        else if (buttonId === "deleteLast") {
        this.deleteLastElement();
        }
        });
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.fileContent.complete();
        this.subscriptionOfToolbar.unsubscribe();
    }

    get viewBox(): string {
        
        const canvas = document.getElementById('canvas');
       
        if (canvas) {
            
          const rect = canvas.getBoundingClientRect();
            
          // die viewBox des svg Elements wird an den Zoomfaktor angepasst (Je größer die viewBox, desto kleiner das Diagramm)
          // die viewBox ist eine Art zusätzlicher innerer Canvas der die Größe des Diagramms bestimmt unabhängig von der Größe des äußeren Canvas
          return `0 0 ${rect.width * this.zoomFactor} ${rect.height * this.zoomFactor}`;
        }
        return '0 0 0 0'; // Default viewBox if canvas is not available
    }

    public processDropEvent(e: DragEvent) {
        e.preventDefault();

        const fileLocation = e.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);

        if (fileLocation) {
            this.fetchFile(fileLocation);
        } else {
            this.readFile(e.dataTransfer?.files);
        }
    }

    public prevent(e: DragEvent) {
        // dragover must be prevented for drop to work
        e.preventDefault();
    }

    private fetchFile(link: string) {

        this._http.get(link,{
            responseType: 'text'
        }).pipe(
            catchError(err => {
                console.error('Error while fetching file from link', link, err);
                return of(undefined);
            }),
            take(1)
        ).subscribe(content => {
            if (content === undefined) {
                return;
            }
            const fileExtension = link.split('.').pop() || '';
            this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
        })
    }

    private readFile(files: FileList | undefined | null) {
        if (files === undefined || files === null || files.length === 0) {
            return;
        }
        this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(content => {

            const fileExtension = files[0].name.split('.').pop() || '';
            this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
        });
    }



    private draw() {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        }

        this.clearDrawingArea();

        const elements = this._svgService.createSvgElements(this._displayService.diagram);
        let groupedElements = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        groupedElements.setAttribute('id', 'groupedSvgDiagram');
        for (const element of elements) {
            groupedElements.appendChild(element);
        }
        this.drawingArea.nativeElement.appendChild(groupedElements);
    }

    private clearDrawingArea(clearElements?: boolean) {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
        
        //Array leeren, selektierte Elemente und Counter Variablen zurücksetzen
        if(clearElements) {
            this._diagram?.clearElements();
            this._diagram?.resetSelectedElements();
            this._diagram?.resetCounterVar();
            this._diagram?.clearOrder();
        }
    }
    
    private deleteLastElement() {

        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        if (this._diagram && drawingArea.childElementCount > 0) {
        
            let elementOrder = this._diagram.order;
            let lastID = elementOrder.pop();
            if (lastID?.startsWith("p")) {
                let lastCircleObject = this._diagram.places.pop();
                let lastSvgShape = lastCircleObject?.svgElement;
                if (lastCircleObject && lastSvgShape) {
                drawingArea.removeChild(lastSvgShape);
                this._diagram.idCircleCount--;
                }  
            }
            else if (lastID?.startsWith("t")) {
                let lastRectObject = this._diagram.transitions.pop();
                let lastSvgShape = lastRectObject?.svgElement;
                if (lastRectObject && lastSvgShape) {
                    drawingArea.removeChild(lastSvgShape);
                    this._diagram.idRectCount--;
                }  
            }
            else if (lastID?.startsWith("a")){

                let lastLineObject = this._diagram.lines.pop();
                let lastSvgLine = lastLineObject?.svgElement;
                if(lastLineObject && lastSvgLine){
                    drawingArea.removeChild(lastSvgLine);
                    this._diagram.idLineCount--;
                }
            }
            this._diagram.resetSelectedElements();
            this._diagram.lightningCount = 0;
        }         
    }  
                

    onCanvasClick(event: MouseEvent) {
        console.log("Canvas clicked", this._diagram);
        // Koordinaten des Klick Events relativ zum SVG Element
        const svgElement = document.getElementById('canvas');
        if (!svgElement) {
            return;
        }
        // Position des SVG Elements relativ zum Viewport
        const svgContainer = svgElement.getBoundingClientRect();
        // Berechnung der Maus Koordinanten relativ zum SVG Element 
        // und Anpassung an den Zoomfaktor, da es sonst zu einem Offset beim Klicken kommt
        const mouseX = (event.clientX - svgContainer.left) * this.zoomFactor;
        const mouseY = (event.clientY - svgContainer.top) * this.zoomFactor;
      
        // Check ob linker Mouse Button geklickt und Button aktiviert
       if (event.button === 0 && this.activeButtonService.isCircleButtonActive) {

            let svgCircle = this.drawCircle(mouseX ,mouseY)
            svgElement.appendChild(svgCircle);

        }

        else if (event.button === 0 && this.activeButtonService.isRectangleButtonActive) {

            let svgRect = this.drawRect(mouseX, mouseY);
            svgElement.appendChild(svgRect);
        }
        //Blitz-Tool
        else if (event.button === 0 && this.activeButtonService.isBoltButtonActive){
            
            if(this._diagram?.lightningCount === 0){

                let targetIsCircle: boolean = true;
                let svgCircle = this.drawCircle(mouseX ,mouseY);
                svgElement.appendChild(svgCircle);
                //Gerade erzeugtes Kreisobjekt als selected Circle setzen
                const lastCircleObject = this._diagram?.places[this._diagram?.places.length - 1];
                this._diagram.selectedCircle = lastCircleObject!.svgElement;
                if (this._diagram.selectedRect !== undefined && this._diagram.selectedCircle !== undefined) {
                    this.connectElements(this._diagram.selectedCircle, this._diagram.selectedRect, targetIsCircle);
                }
                this._diagram.lightningCount++;
            }
            
            else if (this._diagram?.lightningCount === 1){

                let targetIsCircle: boolean = false;
                let svgRect = this.drawRect(mouseX, mouseY);
                svgElement.appendChild(svgRect);
                //Gerade erzeugtes Rechteckobjekt als selected Rect setzen
                const lastRectObject = this._diagram?.transitions[this._diagram?.transitions.length - 1];
                this._diagram.selectedRect = lastRectObject!.svgElement;
                if ( this._diagram.selectedRect !== undefined && this._diagram.selectedCircle !== undefined) {
                    this.connectElements(this._diagram.selectedCircle, this._diagram.selectedRect, targetIsCircle);
                }
                
                this._diagram.lightningCount--;
            }
        } 
       
    }

    drawCircle(mouseX:number, mouseY:number){

        // Aufruf der Funktion zu Erzeugung eines Objekts
        let circleObject = this._diagram?.createCircleObject(mouseX, mouseY);
        if(!circleObject){ throw new Error("CircleObject is undefined") }
        let svgCircle = circleObject.createSVG();
        // Objekt mit SVG Element verknüpfen
        circleObject.svgElement = svgCircle;
        svgCircle.addEventListener('click', () => {
            this.onCircleSelect(svgCircle);  
        });
        return svgCircle;
    }

    drawRect(mouseX: number, mouseY: number){

        //  Aufruf der Funktion zu Erzeugung eines Objekts
        let rectObject = this._diagram?.createRectObject(mouseX, mouseY);
        if(!rectObject){ throw new Error("RectObject is undefined") }
        const width = rectObject.width;
        const height = rectObject.height;
        let svgRect = rectObject.createSVG();
        // Anpassen der Koord. des SVGRects, damit es von der Mitte aufgezogen wird
        const x = mouseX - width / 2;
        const y = mouseY - height / 2;
        svgRect.setAttribute('x', x.toString());
        svgRect.setAttribute('y', y.toString());
        // Objekt mit SVG Element verknüpfen
        rectObject.svgElement = svgRect;
        svgRect.addEventListener('click', () => {
            this.onRectSelect(svgRect);
        });  
        return svgRect
    }


    connectElements(circle: SVGElement, rect: SVGElement, targetIsCircle: boolean) {

        if (this.activeButtonService.isArrowButtonActive || this.activeButtonService.isBoltButtonActive) {
            const svgElement = document.getElementById('canvas');

            let cirlceObjectID = circle.id;
            let circleObject = this._diagram?.places.find(place => place.id === cirlceObjectID);
            let rectobjectID = rect.id;
            let rectObject =  this._diagram?.transitions.find(transition => transition.id === rectobjectID);
            
            if(targetIsCircle){
                
                // Aufruf der Funktion zu Erzeugung eines Objekts
                let lineObject = this._diagram?.createLineObject(rectObject!, circleObject!);

               if(!lineObject){ throw new Error("LineObject is undefined")}
                lineObject.createSVG();    

                let svgLine = lineObject.svgElement;
                
                if (svgElement) {
                    if (svgElement.firstChild){
                        svgElement.insertBefore(svgLine!,svgElement.firstChild);
                    }
                }

            }
            else{
                let lineObject = this._diagram?.createLineObject(circleObject!, rectObject!);
                if(!lineObject){ throw new Error("LineObject is undefined")}
                lineObject.createSVG();
               
                let svgLine = lineObject.svgElement;
                if (svgElement) {
                    if (svgElement.firstChild){
                        svgElement.insertBefore(svgLine!,svgElement.firstChild);
                    }
                }
            }

            if(this.activeButtonService.isArrowButtonActive){
                this._diagram?.resetSelectedElements();
            }      
        }
    }


    onCircleSelect(circle: SVGElement){
        this._diagram!.selectedCircle = circle;
        if (this._diagram?.selectedRect) {
            let circleIsTarget: boolean = true;
            this.connectElements(this._diagram?.selectedCircle, this._diagram?.selectedRect, circleIsTarget);    
        }
        else
        return;
    }

    onRectSelect(rect: SVGElement){
        this._diagram!.selectedRect= rect;
        if (this._diagram?.selectedCircle) {
            let circleIsTarget: boolean = false;
            this.connectElements(this._diagram?.selectedCircle, this._diagram?.selectedRect, circleIsTarget);    
        }
        else
        return;
    }

  handleRightClick(event: MouseEvent) {
        event.preventDefault(); // Kontextmenü mit Rechtsklick verhindern

        if(this.activeButtonService.isBoltButtonActive){
            
            this._diagram?.resetSelectedElements();
            this._diagram!.lightningCount = 0;
        }
    }


}
