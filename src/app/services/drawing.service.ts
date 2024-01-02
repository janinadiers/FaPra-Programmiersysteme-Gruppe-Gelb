import { Injectable } from '@angular/core';
import {Diagram} from "../classes/diagram/diagram";
import {Subscription} from "rxjs";
import {DisplayService} from "./display.service";
import {Place} from "../classes/diagram/place";
import {Transition} from "../classes/diagram/transition";
import {Line} from "../classes/diagram/line";
import {ActivebuttonService} from "./activebutton.service";

@Injectable({
  providedIn: 'root'
})

export class DrawingService {
    private _diagram: Diagram | undefined;
    private _sub: Subscription;

    constructor(private diplayService: DisplayService,
                private activeButtonService: ActivebuttonService
                )
    {
        this._sub = this.diplayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
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

    // Kreise zeichnen bzw. Stellen anlegen
    drawCircle(mouseX:number, mouseY:number){

        // Aufruf der Funktion zu Erzeugung eines Objekts
        let circleObject = this._diagram?.createCircleObject(mouseX, mouseY);
        if(!circleObject){ throw new Error("CircleObject is undefined") }

        // Erstellen des SVG-Elements
        circleObject.createSVG();

        // Objekt mit SVG Element verknüpfen
        circleObject.svgElement!.addEventListener('click', () => {
            this.onCircleSelect(circleObject!);
        });

        return circleObject;
    }

    onCircleSelect(circle: Place){
        this._diagram!.selectedCircle = circle;
        if(Diagram.drawingIsActive || Diagram.algorithmIsActive){return}

        this.changeTokenButtonColor('red');

        // Farben setzen: alle mit schwarzer Umrandung, danach ausgewählter rot
        this.deselectPlacesAndLines();
        circle.svgElement!.children[0].setAttribute('stroke', 'red');
        circle.svgElement!.children[2].setAttribute('stroke', 'red');
        circle.svgElement!.children[0].setAttribute('stroke-width', '2');
        circle.svgElement!.children[1].setAttribute('stroke','red');
        
        if (this._diagram!.selectedRect) {
            let circleIsTarget: boolean = true;
            this.connectElements(this._diagram!.selectedCircle, this._diagram!.selectedRect, circleIsTarget);
        }
        else
            return;

        
        
    }

    // Rechtecke zeichnen bzw. Transitionen anlegen
    drawRect(mouseX: number, mouseY: number){
        //  Aufruf der Funktion zu Erzeugung eines Objekts
        let rectObject = this._diagram?.createRectObject(mouseX, mouseY);
        if(!rectObject){ throw new Error("RectObject is undefined") }

        // Erstellen des SVG-Elements
        rectObject.createSVG();

        // Objekt mit SVG Element verknüpfen
        rectObject.svgElement!.addEventListener('click', () => {
            this.onRectSelect(rectObject!);
        });

        return rectObject
    }

    onRectSelect(rect: Transition){
        this._diagram!.selectedRect = rect;
        
        if (this._diagram!.selectedCircle) {
            let circleIsTarget: boolean = false;
            this.connectElements(this._diagram!.selectedCircle, this._diagram!.selectedRect, circleIsTarget);
        }
        else
            return;
        
        
    }

    // Linien zeichnen bzw. Kanten erstellen
    connectElements(circle: Place, rect: Transition, targetIsCircle: boolean) {
        // Check, ob Blitz-Tool oder Linie angeklickt ist
        if (this.activeButtonService.isArrowButtonActive || this.activeButtonService.isBoltButtonActive) {
            // Canvas als SVG-Element laden
            const svgElement = document.getElementById('canvas');

            // Kreis-Objekt (Stelle) finden und Variable dafür erstellen
            let cirlceObjectID = circle.id;
            let circleObject = this._diagram?.places.find(place => place.id === cirlceObjectID);
            // Transition (Rechteck) finden und Objekt dafür erstellen
            let rectobjectID = rect.id;
            let rectObject =  this._diagram?.transitions.find(transition => transition.id === rectobjectID);

            // Linie von Rechteck zu Kreis zeichnen
            if(targetIsCircle){
                // Aufruf der Funktion zu Erzeugung eines Objekts
                let lineObject = this._diagram?.createLineObject(rectObject!, circleObject!);
                if(!lineObject){ throw new Error("LineObject is undefined")}

                // Erstellen des SVG
                lineObject.createSVG();
                let svgLine = lineObject.svgElement;
                if (svgElement) {
                    if (svgElement.firstChild){
                        svgElement.insertBefore(svgLine!,svgElement.firstChild);
                    }
                }
                svgLine?.addEventListener(('click'), () => {
                    if(svgLine){
                        this.onLineSelect(lineObject!);
                    }
                } );
            }
            // Linie von Kreis zu Rechteck zeichnen
            else{
                // Erstellen des Objekts
                let lineObject = this._diagram?.createLineObject(circleObject!, rectObject!);
                if(!lineObject){ throw new Error("LineObject is undefined")}
                lineObject.createSVG();

                // Erstellen des SVG
                let svgLine = lineObject.svgElement;
                if (svgElement) {
                    if (svgElement.firstChild){
                        svgElement.insertBefore(svgLine!,svgElement.firstChild);
                    }
                }
                svgLine?.addEventListener(('click'), () => {
                    if(svgLine != undefined){
                        this.onLineSelect(lineObject!);
                    }
                } );
            }

            if(this.activeButtonService.isArrowButtonActive){
                this._diagram?.resetSelectedElements();
            }
        }
    }

    onLineSelect(line: Line) {
        this._diagram!.selectedLine = line;

        if(Diagram.drawingIsActive){return}
        this.changeTokenButtonColor('blue');

        // Farben setzen: alle Element schwarz setzen, danach das ausgewählte blau
        this.deselectPlacesAndLines();

        line.svgElement!.querySelector('text')!.setAttribute('stroke','blue');
        line.svgElement!.querySelector('polyline')!.setAttribute('stroke','blue');
        line.svgElement!.querySelector('path')!.setAttribute('fill','blue');
        // line.svgElement!.children[2].setAttribute('stroke', 'blue');
        // line.svgElement!.children[2].setAttribute('stroke-width', '2');

        return;
    }

    // Farbänderungen in der Toolbar
    changeTokenButtonColor(color:string){
        let addTokenButton = document.querySelector('.add-token > mat-icon') as HTMLElement;
        let removeTokenButton = document.querySelector('.remove-token > mat-icon') as HTMLElement;
        removeTokenButton!.style.color = color;
        addTokenButton!.style.color = color;
    }

    // Aufheben der Auswahl
    deselectPlacesAndLines(){
        this._diagram?.places.forEach((element) => {
            element.svgElement!.querySelector('text')!.setAttribute('stroke','black'); // Farbe des Tokens
            element.svgElement!.querySelector('circle')!.setAttribute('stroke','black'); // Farbe des Kreisrandes
            // element.svgElement?.children[0].setAttribute('stroke', 'black'); // Farbe des Kreisrandes
            element.svgElement?.children[2].setAttribute('stroke', 'black'); // Farbe des Labels
        });
        this._diagram?.lines.forEach((element) => {
            element.svgElement!.querySelector('text')!.setAttribute('stroke','black');
            element.svgElement!.querySelector('polyline')!.setAttribute('stroke','black');
            element.svgElement!.querySelector('path')!.setAttribute('fill','black');
            // element.svgElement!.children[2].setAttribute('stroke', 'transparent');
            // element.svgElement!.children[2].setAttribute('fill','transparent');
            if(element.tokens > 1) {
                element.svgElement!.querySelector('circle')!.setAttribute('fill','white');
                //element.svgElement!.children[2].setAttribute('fill','white');
            }
            else {
                element.svgElement!.querySelector('circle')!.setAttribute('fill', 'transparent');
            }
        });

        // Welche Ansteuerung ist günstiger - die über die Position im Array oder die über der Queri-Selector?
    }

}
