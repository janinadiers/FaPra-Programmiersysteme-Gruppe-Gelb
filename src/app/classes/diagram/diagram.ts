
import { Line } from './line';
import { Place } from './place';
import { Transition } from './transition';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class Diagram {

    private readonly _places: Array<Place> = [];
    private readonly _transitions: Array<Transition>;
    private readonly _lines: Array<Line>;
    private readonly _order: Array<string>;

    private readonly _placeMap = new Map <string, Place>;
    private readonly _lineMap = new Map <string, Line>;
    private readonly _transitionMap = new Map <string, Transition>;

    selectedCircle: SVGElement | undefined = undefined;
    selectedRect: SVGElement | undefined = undefined;
    selectedLine: SVGElement | undefined = undefined;

    lightningCount: number = 0;

    static toolbarIsActive = false;
    static zoomFactor = 1;
    static viewBox:{x: number, y: number, width: number, height: number} = {x: 0, y: 0, width: 0, height: 0};
    private _canvasElement: SVGElement | undefined;

    private _isDragging = false;
    private startPoint: {x: number, y: number} = {x: 0, y: 0};

    constructor(places: Array<Place>, transitions: Array<Transition>, lines?: Array<Line>) {
        this._places = places;
        this._transitions = transitions;
        this._lines = lines ?? [];
        this._order = [];

        // Maps, mit denen die Elemente anhand des IdStrings abgerufen werden können
        places.forEach((element) => {
            this._placeMap.set(element.id,element);
        });

        transitions.forEach((element) => {
            this._transitionMap.set(element.id,element);
        });

        if(lines) {
            lines.forEach((element) => {
                this._lineMap.set(element.id,element);
            });
        }
    }

    set canvasElement(canvas: SVGElement | undefined) {
        if(!canvas) {return}

        this._canvasElement = canvas;
        this._canvasElement?.addEventListener('mousedown', (event) => {
          this.processMouseDown(event);

        });
        // Der EventListener ist auf dem window registriert, damit auch dann ein MouseUp Event ausgelöst wird, wenn die Maus außerhalb des Canvas losgelassen wird
        window.addEventListener('mouseup', (event) => {
            this.processMouseUp();
        });
        this._canvasElement?.addEventListener('mousemove', (event) => {
          this.processMouseMove(event);
        });
    }

    get places(): Array<Place> {
        return this._places;
    }

    get transitions(): Array<Transition> {
        return this._transitions;
    }

    get lines(): Array<Line> {
        return this._lines;
    }

    get order(): Array<string> {
        return this._order;
    }

    get placeMap() {
        return this._placeMap;
    }

    get lineMap() {
        return this._lineMap;
    }

    get transitionMap() {
        return this._transitionMap;
    }

    pushPlace(place: Place): void {
        this._placeMap.set(place.id,place);
        this._places.push(place);
    }

    pushTransition(transition: Transition): void {
        this._transitionMap.set(transition.id,transition);
        this._transitions.push(transition);
    }

    pushLine(line: Line): void {
        this._lineMap.set(line.id,line);
        this._lines.push(line);
    }

    pushID(id: string) {
        this._order.push(id);
    }

    clearElements(): void {
        this._places.splice(0, this._places.length);
        this._transitions.splice(0, this._transitions.length);
        this._lines.splice(0, this._lines.length);
    }

    createCircleObject(x: number, y:number){

        let idString: string = "p" + (this._places.length + 1);
        let circleObject = new Place(idString, x, y);
        // Objekt im Array abspeichern
        this.pushPlace(circleObject);
        this.pushID(idString);
        
        return circleObject;
    }


    createRectObject (x: number, y: number){

        let idString: string = "t" + (this._transitions.length + 1);
        let rectObject = new Transition(idString, x, y);
        // Objekt im Array abspeichern
        this.pushTransition(rectObject);
        this.pushID(idString);
        return rectObject;
    }

    createLineObject (source: Transition | Place, target: Transition| Place){

        let idString: string = "a" + (this.lines.length + 1);
        let lineObject = new Line (idString, source, target);
        // Objekt im Array abspeichern
        this.pushLine(lineObject);
        this.pushID(idString);
        return lineObject;
    }

    resetSelectedElements() {
        this.selectedCircle = undefined;
        this.selectedRect = undefined;
        this.selectedLine = undefined;
    }

    resetCounterVar() {
        this.lightningCount = 0;
    }

    clearOrder() {
        this._order.splice(0, this._order.length);
    }

    private processMouseDown(event: MouseEvent) {

        if(Diagram.toolbarIsActive){
            return;
        }

        this._isDragging = true;
        const svgContainer = this._canvasElement?.getBoundingClientRect();

        this.startPoint = {
          x: (event.clientX - svgContainer!.left) * Diagram.zoomFactor + Diagram.viewBox.x,
          y: (event.clientY - svgContainer!.top) * Diagram.zoomFactor + Diagram.viewBox.y
      };

    }

    private processMouseUp() {

        if (this._isDragging) {
            this._isDragging = false;
        }
    }

    private processMouseMove(event: MouseEvent) {

        if (this._isDragging) {
          const svgContainer = this._canvasElement?.getBoundingClientRect();
          const x = (( event.clientX - svgContainer!.left ) * Diagram.zoomFactor)- this.startPoint.x;
          const y = ((event.clientY - svgContainer!.top ) * Diagram.zoomFactor)- this.startPoint.y;

          Diagram.viewBox.x = -x;
          Diagram.viewBox.y = -y;

          this._canvasElement?.setAttribute('viewBox', `${Diagram.viewBox.x} ${Diagram.viewBox.y} ${Diagram.viewBox.width} ${Diagram.viewBox.height}`)
        }
    }
}
