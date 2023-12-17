import {Component, ElementRef, EventEmitter, OnDestroy, Output, OnInit, ViewChild} from '@angular/core';
import {DisplayService} from '../../services/display.service';
import { catchError, of, Subscription, take } from 'rxjs';
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

    constructor(
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
                Diagram.zoomFactor = Diagram.zoomFactor - 0.1;
            }

            else if(buttonId === "zoom-out"){
               Diagram.zoomFactor = Diagram.zoomFactor + 0.1;
            }
        });
    }

    ngOnInit() {

        this._diagram!.canvasElement = document.getElementById('canvas') as unknown as SVGElement;
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

        const canvas= document.getElementById('canvas');

        if (canvas) {

          const rect = canvas.getBoundingClientRect();

          // die viewBox des svg Elements wird an den Zoomfaktor angepasst (Je größer die viewBox, desto kleiner das Diagramm)
          // die viewBox ist eine Art zusätzlicher innerer Canvas der die Größe des Diagramms bestimmt unabhängig von der Größe des äußeren Canvas
          Diagram.viewBox.width = rect.width * Diagram.zoomFactor;
          Diagram.viewBox.height = rect.height * Diagram.zoomFactor;


          return `${Diagram.viewBox.x} ${Diagram.viewBox.y} ${Diagram.viewBox.width} ${Diagram.viewBox.height}`;
        }
        // Default viewBox if canvas is not available
        return '0 0 0 0';
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

        let groupedElements = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        groupedElements.setAttribute('id', 'groupedSvgDiagram');
        if(this._diagram){
            [...this._diagram.lines, ...this._diagram.places, ...this._diagram.transitions].forEach(element => {

                groupedElements.appendChild(element.svgElement!);

            });

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

            if (lastID?.startsWith("p") && lastID.length <= 4) {
                this._diagram.places.pop();
                drawingArea.removeChild(drawingArea.lastChild as ChildNode);   
            }
            else if (lastID?.startsWith("t") && lastID.length <= 4) {
                this._diagram.transitions.pop();
                drawingArea.removeChild(drawingArea.lastChild as ChildNode);  
                }
            else if (lastID && lastID.length >= 5){
                this._diagram.lines.pop();
                drawingArea.removeChild(drawingArea.firstChild as ChildNode);
            }
            
            this._diagram.resetSelectedElements();
            this._diagram.lightningCount = 0;
        }
    }

    onCanvasClick(event: MouseEvent) {

        // console.log(this._diagram);

        // Event-Listener für Places, Transitions und Lines hinzufügen
        this._diagram?.places.forEach((element) => {
            element.svgElement?.addEventListener(('click'), () => {
                if(!element.svgElement) {return};
                this.onCircleSelect(element!.svgElement);
            });
        });

        this._diagram?.lines.forEach((element) => {
            element.svgElement?.addEventListener(('click'), () => {
                if(!element.svgElement) {return};
                this.onLineSelect(element!.svgElement);
            });
        });

        this._diagram?.transitions.forEach((element) => {
            element.svgElement?.addEventListener(('click'), () => {
                if(!element.svgElement) {return;}
                this.onRectSelect(element!.svgElement);
            });
        });

        // Koordinaten des Klick Events relativ zum SVG Element
        const svgElement = document.getElementById('canvas');

        if (!svgElement) {
            return;
        }
        // Position des SVG Elements relativ zum Viewport
        const svgContainer = svgElement.getBoundingClientRect();
        // Berechnung der Maus Koordinanten relativ zum SVG Element
        // und Anpassung an den Zoomfaktor, da es sonst zu einem Offset beim Klicken kommt
        const mouseX = (event.clientX - svgContainer.left) * Diagram.zoomFactor + Diagram.viewBox.x;
        const mouseY = (event.clientY - svgContainer.top) * Diagram.zoomFactor + Diagram.viewBox.y;

        // Check ob linker Mouse Button geklickt und Button aktiviert
       if (event.button === 0 && this.activeButtonService.isCircleButtonActive) {
            
            this.changeTokenButtonColor('black');
            let svgCircle = this.drawCircle(mouseX ,mouseY)
            svgElement.appendChild(svgCircle);

        }
        
        
        else if (event.button === 0 && this.activeButtonService.isRectangleButtonActive) {
            
            this.changeTokenButtonColor('black');
            let svgRect = this.drawRect(mouseX, mouseY);
            svgElement.appendChild(svgRect);
        }
        //Blitz-Tool
        else if (event.button === 0 && this.activeButtonService.isBoltButtonActive){
            this.changeTokenButtonColor('black');
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

                svgLine?.addEventListener(('click'), () => {
                    if(svgLine){
                        this.onLineSelect(svgLine);
                    }
                } );  // Event-Listener, damit Kante angeklickt werden kann (eine Richtung) */

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



                svgLine?.addEventListener(('click'), () => {
                    if(svgLine != undefined){
                        this.onLineSelect(svgLine);
                        }
                    } );  // Event-Listener, damit Kante angeklickt werden kann (andere Richtung) */
            }

            if(this.activeButtonService.isArrowButtonActive){
                this._diagram?.resetSelectedElements();
            }
        }
    }

    onLineSelect(line: SVGElement) {
        console.log("Line selected", Diagram.drawingIsActive, Diagram.algorithmIsActive);
        
        this._diagram!.selectedLine = line; // ohne "!" wird selectedLine undefined...

        if(Diagram.drawingIsActive){return}

        this.changeTokenButtonColor('blue');
        
        // Farben setzen: alle Element schwarz setzen, danach das ausgewählte blau
        this.deselectPlacesAndLines();
        line.children[2].setAttribute('stroke', 'blue');
        line.children[2].setAttribute('stroke-width', '2');

        return;
    }


    onCircleSelect(circle: SVGElement){
        console.log("Circle selected", Diagram.drawingIsActive, Diagram.algorithmIsActive);
        
        this._diagram!.selectedCircle = circle;
        
        if(Diagram.drawingIsActive || Diagram.algorithmIsActive){return}

        this.changeTokenButtonColor('red');

        // Farben setzen: alle mit schwarzer Umrandung, danach ausgewählter rot
        this.deselectPlacesAndLines();
        circle.children[0].setAttribute('stroke', 'red');
        circle.children[2].setAttribute('stroke', 'red');
        circle.children[0].setAttribute('stroke-width', '2');
        
        // weitere Farbänderungen unter element.ts bei processMouseUp() und processMouseDown() (?)

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

    changeTokenButtonColor(color:string){
    
        let addTokenButton = document.querySelector('.add-token > mat-icon') as HTMLElement;
        let removeTokenButton = document.querySelector('.remove-token > mat-icon') as HTMLElement;
        removeTokenButton!.style.color = color;
        addTokenButton!.style.color = color;
         
    }

    deselectPlacesAndLines(){
        this._diagram?.places.forEach((element) => {
            element.svgElement?.children[0].setAttribute('stroke', 'black');
            element.svgElement?.children[2].setAttribute('stroke', 'black');
            
           
        });
        this._diagram?.lines.forEach((element) => {
            element.svgElement!.children[2].setAttribute('stroke', 'transparent');
        });
    }


}
