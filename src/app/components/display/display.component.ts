import {Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';
import {DisplayService} from '../../services/display.service';
import {catchError, of, Subscription, take} from 'rxjs';
import {SvgService} from '../../services/svg.service';
import {Diagram} from '../../classes/diagram/diagram';
import {ExampleFileComponent} from "../example-file/example-file.component";
import {FileReaderService} from "../../services/file-reader.service";
import {HttpClient} from "@angular/common/http";
import { ActivebuttonService } from 'src/app/services/activebutton.service';
//import { SvgElementService } from 'src/app/services/svg-element.service';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileContent') fileContent: EventEmitter<string>;

    private _sub: Subscription;
    private _diagram: Diagram | undefined;

    constructor(private _svgService: SvgService,
                private _displayService: DisplayService,
                private _fileReaderService: FileReaderService,
                private _http: HttpClient,
                private activeButtonService: ActivebuttonService) {
                    
        this.fileContent = new EventEmitter<string>();

        this._sub  = this._displayService.diagram$.subscribe(diagram => {
            console.log('new diagram');

            this._diagram = diagram;
            this.draw();
        });
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.fileContent.complete();
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
            this.emitFileContent(content);
        })
    }

    private readFile(files: FileList | undefined | null) {
        if (files === undefined || files === null || files.length === 0) {
            return;
        }
        this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(content => {
            this.emitFileContent(content);
        });
    }

    private emitFileContent(content: string | undefined) {
        if (content === undefined) {
            return;
        }
        this.fileContent.emit(content);
    }

    private draw() {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        }

        this.clearDrawingArea();
        const elements = this._svgService.createSvgElements(this._displayService.diagram);
        for (const element of elements) {
            this.drawingArea.nativeElement.appendChild(element);
        }
    }

    private clearDrawingArea() {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
    }

    onCanvasClick(event: MouseEvent) {

        // Koordinaten des Klick Events relativ zum SVG Element 
        const svgElement = document.getElementById('canvas');
        if (!svgElement) {
            return;
        }
        // Position des SVG Elements relativ zum Viewport
        const svgContainer = svgElement.getBoundingClientRect();
        // Berechnung der Maus Koordinanten relativ zum SVG Element 
        const mouseX = event.clientX - svgContainer.left;
        const mouseY = event.clientY - svgContainer.top;
      
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
                const lastCircleObject = this._diagram.elements.find(element=> element.id === "p" + (this._diagram!.idCircleCount-1));
                this._diagram.selectedCircle = lastCircleObject!.svgElement;
                if (this._diagram.selectedRect !== undefined && this._diagram.selectedCircle!== undefined) {
                    this.connectElements(this._diagram.selectedCircle, this._diagram.selectedRect, targetIsCircle);
                }
                this._diagram.lightningCount++;
            }
            
            else if (this._diagram?.lightningCount === 1){

                let targetIsCircle: boolean = false;
                let svgRect = this.drawRect(mouseX, mouseY);
                svgElement.appendChild(svgRect);
                //Gerade erzeugtes Rechteckobjekt als selected Rect setzen
                const lastRectObject = this._diagram.elements.find(element=> element.id === "t" + (this._diagram!.idRectCount-1));
                this._diagram.selectedRect = lastRectObject!.svgElement;
                if (this._diagram.selectedRect !== undefined && this._diagram.selectedCircle!== undefined) {
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
        let svgCircle = circleObject?.createSVG();
        // Objekt mit SVG Element verknüpfen
        circleObject.svgElement = svgCircle;
        svgCircle.addEventListener('click', () => {
            this.onCircleSelect(svgCircle);
            console.log("Place " + svgCircle.id  + " ist ausgewählt.");   
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
            console.log("Transition " + svgRect.id  + " ist ausgewählt.");  
        });  
        return svgRect
    }

    
    connectElements(circle: SVGElement, rect: SVGElement, targetIsCircle: boolean) {
        
        if (this.activeButtonService.isArrowButtonActive || this.activeButtonService.isBoltButtonActive) {
            const svgElement = document.getElementById('canvas');

            let cirlceObjectID = circle.id;
            let circleObject = this._diagram?.elements.find(element => element.id === cirlceObjectID);
            let rectobjectID = rect.id;
            let rectObject =  this._diagram?.elements.find(element => element.id === rectobjectID);
            
            if(targetIsCircle){
                // Aufruf der Funktion zu Erzeugung eines Objekts
                let lineObject = this._diagram?.createLineObject(rectObject!, circleObject!);
                if(!lineObject){ throw new Error("LineObject is undefined")}
                lineObject.createSVG();
                let svgLine = lineObject.svgElement;
                
                if (svgElement) {
                    if (svgElement.firstChild){
                        console.log('insert line between: ', circleObject, rectObject, 'target is circle' );
                        
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
                        console.log('insert line between: ', circleObject, rectObject, 'target is rect' );

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
        console.log('circle selected');
        
        this._diagram!.selectedCircle = circle;
        if (this._diagram?.selectedRect) {
            let circleIsTarget: boolean = true;
            this.connectElements(this._diagram?.selectedCircle, this._diagram?.selectedRect, circleIsTarget);    
        }
        else
        return; 
    }

    onRectSelect(rect: SVGElement){
        console.log('rect selected');
        
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
            console.log("Right-click event works");
        }
    }




}
