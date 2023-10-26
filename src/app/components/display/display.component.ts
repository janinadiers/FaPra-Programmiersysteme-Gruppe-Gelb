import {Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';
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
export class DisplayComponent implements OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileContent') fileContent: EventEmitter<string>;

    private _sub: Subscription;
    private _diagram: Diagram | undefined;

    constructor(private _svgService: SvgService,
                private _displayService: DisplayService,
                private _fileReaderService: FileReaderService,
                private _http: HttpClient,
                private activeButtonService: ActivebuttonService,
                private svgElementService: SvgElementService ) {

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

    private drawCircle (x:number, y: number){
       
        const svgElement = document.getElementById('canvas');
        
        if (!svgElement) {
            return;
        }
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  
        // Attribute
        circle.setAttribute('cx', x.toString()); // x-Koordinate
        circle.setAttribute('cy', y.toString()); // y-Koordinate
        circle.setAttribute('r', '30'); // Radius 
        circle.setAttribute('fill', 'white'); // Farbe 
        circle.setAttribute('stroke', 'black'); // Border Farbe
        circle.setAttribute('stroke-width', '2'); 
        
        svgElement.appendChild(circle);
    }


    private drawRectangle(x:number, y: number, width: number, height: number){
        
        const svgElement = document.getElementById('canvas');
        
        if (!svgElement) {
            return;
        }
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        // Attribute
        rect.setAttribute('x', x.toString()); 
        rect.setAttribute('y', y.toString()); 
        rect.setAttribute('width', width.toString()); 
        rect.setAttribute('height', height.toString()); 
        rect.setAttribute('fill', 'black'); 
        
        svgElement.appendChild(rect);
    }






    onCanvasClick(event: MouseEvent) {

        // Check ob linker Mouse Button geklickt und Button aktiviert
        if (event.button === 0 && this.activeButtonService.isCircleButtonActive) {
          
            // Koordinaten des Klick Events relativ zum SVG Element 
          const svgElement = document.getElementById('canvas');
          if (!svgElement) {
              return;
          }
  
          // Position des SVG Elements relativ zum Viewport
          const svgRect = svgElement.getBoundingClientRect();
  
          // Berechnung der Maus Koordinanten relativ zum SVG Element 
          const x = event.clientX - svgRect.left;
          const y = event.clientY - svgRect.top;

           //Kreis-Objekt erzeugen
           let circleObject = new Element("circle");
           circleObject.x=x;
           circleObject.y=y;
 
           this.svgElementService.addCircle(circleObject);

            //SVG Kreis Element malen
          this.drawCircle(x,y);
        }  
    
     else if (event.button === 0 && this.activeButtonService.isRectangleButtonActive) {


        // Koordinaten des Klick Events relativ zum SVG Element  
        const svgElement = document.getElementById('canvas');
        if (!svgElement) {
        return;
        }

        // Position des SVG Elements relativ zum Viewport
        const svgRect = svgElement.getBoundingClientRect();

        // Berechnung der Maus Koordinanten relativ zum SVG Element
        const mouseX = event.clientX - svgRect.left;
        const mouseY = event.clientY - svgRect.top;

        const width = 30; 
        const height = 50; 

        // Berechne Koordinaten der linken oberen Ecke des Rechtecks von der Mitte aus
        const x = mouseX - width / 2;
        const y = mouseY - height / 2;

        //Rechteck-Objekt erzeugen
        let rectObject = new Element("rectangle");
        rectObject.x=x;
        rectObject.y=y;

        //Objekt im Array speichern

        this.svgElementService.addRectangle(rectObject);

        //SVG Kreis Element malen
        this.drawRectangle(x,y,width,height);
        }


    }



}
