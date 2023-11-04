import {Component, ElementRef, EventEmitter, OnInit, OnDestroy, Output, ViewChild, untracked} from '@angular/core';
import {DisplayService} from '../../services/display.service';
import {catchError, of, Subscription, take} from 'rxjs';
import {SvgService} from '../../services/svg.service';
import {Diagram} from '../../classes/diagram/diagram';
import {ExampleFileComponent} from "../example-file/example-file.component";
import {FileReaderService} from "../../services/file-reader.service";
import {HttpClient} from "@angular/common/http";
import { ActivebuttonService } from 'src/app/services/activebutton.service';
import { Element } from 'src/app/classes/diagram/element';
import { SvgElementService } from 'src/app/services/svg-element.service';

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

    constructor(private _svgService: SvgService,
                private _displayService: DisplayService,
                private _fileReaderService: FileReaderService,
                private _http: HttpClient,
                private activeButtonService: ActivebuttonService,
                private svgElementService: SvgElementService ) {

        this.fileContent = new EventEmitter<{fileContent:string, fileExtension:string}>();

        this._sub  = this._displayService.diagram$.subscribe(diagram => {
            console.log('new diagram');

            this._diagram = diagram;
            this.draw();
        });
    }

    ngOnInit() {
        this.subscriptionOfToolbar = 
        this.activeButtonService.getButtonClickObservable().subscribe((buttonId: string) => {
        if (buttonId === "clear"){
            this.clearDrawingArea();
        }
        else
        this.deleteLastElement();
        });
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.subscriptionOfToolbar.unsubscribe();
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
        //Array leeren, selektierte Elemente und Counter Variablen zurücksetzen
        this.svgElementService.clearElements();
        this.svgElementService.resetSelectedElements();
        this.svgElementService.resetCounterVar();
    }

   
    
    private deleteLastElement(){
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        if (drawingArea.childElementCount > 0) {
            if (this.svgElementService.elements.length > 0) {
              let lastShape = this.svgElementService.elements.pop();
              let lastSvg = lastShape?.svgElement;
              
              if (lastSvg) {
                drawingArea.removeChild(lastSvg);
              }
             this.svgElementService.resetSelectedElements();
                this.svgElementService.resetCounterVar();
            }

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
       
       // Check ob linker Mouse Button geklickt und Button aktiviert
       if (event.button === 0 && this.activeButtonService.isCircleButtonActive) {
        
         // Berechnung der Maus Koordinanten relativ zum SVG Element 
         const x = event.clientX - svgContainer.left;
         const y = event.clientY - svgContainer.top;
         // SVG Kreis Element malen
         this.drawCircle(x,y);
       }  
   
       else if (event.button === 0 && this.activeButtonService.isRectangleButtonActive) {

         // Berechnung der Maus Koordinanten relativ zum SVG Element
         const mouseX = event.clientX - svgContainer.left;
         const mouseY = event.clientY - svgContainer.top;
         const width = 20; 
         const height = 40; 
         // Berechne Koordinaten der linken oberen Ecke des Rechtecks von der Mitte aus
         const x = mouseX - width / 2;
         const y = mouseY - height / 2;
         // SVG Rechteck Element malen
         this.drawRectangle(x,y,width,height);
       }

       else if (event.button === 0 && this.activeButtonService.isBoltButtonActive){
            //Blitz-Tool
            if(this.svgElementService.lightningCount === 0){
                const x = event.clientX - svgContainer.left;
                const y = event.clientY - svgContainer.top;
                this.drawCircle(x,y);
                //Gerade erzeugtes Kreisobjekt als selected Circle setzen
                const lastCircleObject = this.svgElementService.elements.find(element=> element.id === "p" + (this.svgElementService.idCircleCount-1));
                this.svgElementService.selectedCircle = lastCircleObject!.svgElement;
                if (this.svgElementService.selectedRect !== undefined && this.svgElementService.selectedCircle!== undefined) {
                    this.connectElements(this.svgElementService.selectedCircle, this.svgElementService.selectedRect);
                }
                this.svgElementService.lightningCount++;
            }
            
            else if (this.svgElementService.lightningCount === 1){
               
                const mouseX = event.clientX - svgContainer.left;
                const mouseY = event.clientY - svgContainer.top;
                const width = 20; 
                const height = 40;
                const x = mouseX - width / 2;
                const y = mouseY - height / 2;
                this.drawRectangle(x,y,width,height);
                //Gerade erzeugtes Rechteckobjekt als selected Rect setzen
                const lastRectObject = this.svgElementService.elements.find(element=> element.id === "t" + (this.svgElementService.idCircleCount-1));
                this.svgElementService.selectedRect = lastRectObject!.svgElement;
                if (this.svgElementService.selectedRect !== undefined && this.svgElementService.selectedCircle!== undefined) {
                    this.connectElements(this.svgElementService.selectedCircle, this.svgElementService.selectedRect);
                }
                this.svgElementService.lightningCount--;
            }
            
        }     
    }

    private drawCircle (x:number, y: number){
       
        const svgElement = document.getElementById('canvas');
        if (!svgElement) {
            return;
        }
        // ID String für jeden Kreis um 1 erhöhen (p0, p1,..)
        let idString: string = "p" + this.svgElementService.idCircleCount;
        this.svgElementService.idCircleCount++;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        // Attribute
        circle.setAttribute('cx', x.toString()); // x-Koordinate
        circle.setAttribute('cy', y.toString()); // y-Koordinate
        circle.setAttribute('r', '25'); // Radius 
        circle.setAttribute('fill', 'white'); // Farbe 
        circle.setAttribute('stroke', 'black'); // Border Farbe
        circle.setAttribute('stroke-width', '2'); 
        circle.addEventListener('click', () => {
            this.onCircleSelect(circle);
            console.log(idString + " ist ausgewählt");   
        });
        svgElement.appendChild(circle);

        // Kreis-Objekt erzeugen
        let circleObject = new Element(idString);
        circleObject.x=x;
        circleObject.y=y;
        circleObject.svgElement=circle; // mit SVG Element verknüpfen
        // Objekt im Array speichern
        this.svgElementService.addElements(circleObject);
    }

    private drawRectangle(x:number, y: number, width: number, height: number){
        
        const svgElement = document.getElementById('canvas');
        if (!svgElement) {
            return;
        }
        // ID String für jedes Rechteck um 1 erhöhen (t0, t1,..)
        let idString: string = "t" + this.svgElementService.idRectCount;
        this.svgElementService.idRectCount++;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        // Attribute
        rect.setAttribute('x', x.toString()); 
        rect.setAttribute('y', y.toString()); 
        rect.setAttribute('width', width.toString()); 
        rect.setAttribute('height', height.toString()); 
        rect.setAttribute('fill', 'black'); 
        rect.setAttribute('stroke', 'black');
        rect.setAttribute('stroke-width', '2'); 
        rect.addEventListener('click', () => {
            this.onRectSelect(rect);
            console.log(idString + " ist ausgewählt");  
        });  
        svgElement.appendChild(rect);

        // Rechteck-Objekt erzeugen
        let rectObject = new Element(idString);
        rectObject.x=x;
        rectObject.y=y;
        rectObject.svgElement=rect; // mit SVG Element verknüpfen
        // Objekt im Array speichern
        this.svgElementService.addElements(rectObject);
    }


    connectElements(circle: SVGElement, rect: SVGElement) {
        if (this.activeButtonService.isArrowButtonActive || this.activeButtonService.isBoltButtonActive) {
            const svgElement = document.getElementById('canvas');
            const circleX = parseFloat(circle.getAttribute('cx') || '0');
            const circleY = parseFloat(circle.getAttribute('cy') || '0');
            const rectX = parseFloat(rect.getAttribute('x') || '0') + parseFloat(rect.getAttribute('width') || '0') / 2;
            const rectY = parseFloat(rect.getAttribute('y') || '0') + parseFloat(rect.getAttribute('height') || '0') / 2;

            // SVG Line Element
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', circleX.toString());
            line.setAttribute('y1', circleY.toString());
            line.setAttribute('x2', rectX.toString());
            line.setAttribute('y2', rectY.toString());
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '1');       
            
            if (svgElement) {
                if (svgElement.firstChild){
                    svgElement.insertBefore(line,svgElement.firstChild);
                }              
            }
            
            if(this.activeButtonService.isArrowButtonActive){
                this.svgElementService.resetSelectedElements();
            }      
        }
    }
    
    onCircleSelect(circle: SVGElement){
        this.svgElementService.selectedCircle = circle;
        if (this.svgElementService.selectedRect) {
            this.connectElements(this.svgElementService.selectedCircle, this.svgElementService.selectedRect);    
        }
        else
        return;
    }

    onRectSelect(rect: SVGElement){
        this.svgElementService.selectedRect= rect;
        if (this.svgElementService.selectedCircle) {
            this.connectElements(this.svgElementService.selectedCircle, this.svgElementService.selectedRect);    
        }
        else
        return;
    }

    handleRightClick(event: MouseEvent) {
        event.preventDefault(); // Kontextmenü mit Rechtsklick verhindern
      
        if(this.activeButtonService.isBoltButtonActive){
            
            this.svgElementService.resetSelectedElements();
            this.svgElementService.lightningCount = 0;
            console.log("Right-click event works");
        }
    }
}