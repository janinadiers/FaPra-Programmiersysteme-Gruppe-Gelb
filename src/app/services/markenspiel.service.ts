import {Injectable} from '@angular/core';
import {Diagram} from "../classes/diagram/diagram";
import {DisplayService} from "./display.service";

@Injectable({
  providedIn: 'root'
})

export class MarkenspielService {
    private _diagram: Diagram | undefined;
    

    constructor(
        private diplayService: DisplayService)
        {
            this.diplayService.diagram$.subscribe(diagram => {
                this._diagram = diagram;
            });
        }

        // Circle-Handling
        public getCircleId() {
            if(!this._diagram?.selectedCircle){
                return;
            }

            /*
            // Farben setzen: alle mit schwarzer Umrandung, danach ausgewählter rot
            this._diagram?.places.forEach((element) => {
                element.svgElement?.setAttribute('stroke', 'black');
            });
            this._diagram?.lines.forEach((element) => {
                element.svgElement?.setAttribute('stroke', 'black');
                element.svgElement?.setAttribute('stroke-width', '2');
            }); */
            // ist in die Display-Component zu onCircleSelect gewandert

            let idString = this._diagram.selectedCircle.id;
            //this._diagram.placeMap.get(idString)!.svgElement!.setAttribute('stroke','red');
            this._diagram.selectedCircle.setAttribute('stroke','red');

            // alter Code:
            // let idNumber = +this._diagram.selectedCircle.id.charAt(1) -1; // Achtung: funktioniert nicht mehr bei p11...
            // this._diagram.places[idNumber].svgElement?.setAttribute('stroke','red');

            return this._diagram?.selectedCircle?.id
        }

        public getCircleToken() {
            if(!this._diagram?.selectedCircle){
                return;
            }
            let idString = this._diagram.selectedCircle?.id;
            let placeObject = this._diagram.places.find(place => place.id === idString);

            return placeObject?.amountToken;
        }

        public addCircleToken() {
            if(!this._diagram?.selectedCircle){
                return;
            }
            let idString = this._diagram.selectedCircle.id;

            this._diagram.places.find(place => place.id === idString)!.amountToken++;
            this._diagram.places.find(place => place.id === idString)!.svgElement!.children[1].textContent =
                this._diagram.places.find(place => place.id === idString)!.amountToken.toString();

            return;
        }

        public removeCircleToken() {
            if(!this._diagram?.selectedCircle) {
                return;
            }
            let idString = this._diagram.selectedCircle.id;

            let placeObject = this._diagram.places.find(place => place.id === idString);
            placeObject!.amountToken--;

            if(placeObject!.amountToken  < 0) {
                placeObject!.amountToken = 0;
            }
            if(placeObject!.amountToken  > 1) {
            placeObject!.svgElement!.children[1].textContent =
                placeObject!.amountToken.toString();
            } else {
                placeObject!.svgElement!.children[1].textContent = "";
            }

            return;
        }

        // Line-Handling
        public getLineId() {
            if(!this._diagram?.selectedLine){
                return;
            }
            /*
            // Farben setzen: alle Element schwarz setzen, danach das ausgewählte rot
            this._diagram?.lines.forEach((element) => {
                element.svgElement?.setAttribute('stroke', 'black');
                element.svgElement?.setAttribute('stroke-width', '2');
            });
            this._diagram?.places.forEach((element) => {
                element.svgElement?.setAttribute('stroke', 'black');
            }); */
            // ist in die Display-Component zu OnLineSelect gewandert

            let idString = this._diagram.selectedLine.id;

            this._diagram.lines.find(line => line.id === idString)!.svgElement!.querySelector('text')!.
                setAttribute('stroke', 'blue');

            // Markierung für die Gewichte der ausgewählten Kante an die Linie anhängen, damit sie mit verschoben werden kann
            let tokenCircleCx = this._diagram.lines.find(line => line.id === idString)!.calcMidCoords().x;
            let tokenCircleCy = this._diagram.lines.find(line => line.id === idString)!.calcMidCoords().y;
            // Hintergrundkreise der Tokens an die Linie anhängen, sodass sie mit verschoben werden
            this._diagram.lines.find(line => line.id === idString)!.svgElement!.querySelector('circle')!.setAttribute('cx',tokenCircleCx.toString());
            this._diagram.lines.find(line => line.id === idString)!.svgElement!.querySelector('circle')!.setAttribute('cy',tokenCircleCy.toString());
            // Textfelder für die Tokens an die Linie anhängen, damit die bewegt werden können
            this._diagram!.lines.find(line => line.id === idString)!.svgElement!.querySelector('text')!.setAttribute('x',tokenCircleCx.toString());
            this._diagram!.lines.find(line => line.id === idString)!.svgElement!.querySelector('text')!.setAttribute('y',tokenCircleCy.toString());

            if(this._diagram.lines.find(line => line.id === idString)!.tokens > 1){
                this._diagram!.lines.find(line => line.id === idString)!.svgElement!.querySelector('circle')!.
                setAttribute('fill', 'white');
            }
            else {
                this._diagram!.lines.find(line => line.id === idString)!.svgElement!.querySelector('circle')!.
                setAttribute('fill', 'transparent');
            }

            return this._diagram?.selectedLine?.id;
        }

        public getLineToken() {
            if(!this._diagram?.selectedLine){
                return;
            }
            let idString = this._diagram.selectedLine.id;

            return this._diagram.lines.find(line => line.id === idString)!.tokens;
        }

        public addLineToken() {
            if(!this._diagram?.selectedLine){
                return;
            }
            let idString = this._diagram.selectedLine.id;
            this._diagram.lines.find(line => line.id === idString)!.tokens++;
            
            this._diagram.lines.find(line => line.id === idString)!.svgElement!.childNodes[3].textContent =
                this._diagram.lines.find(line => line.id === idString)!.tokens.toString();

            return;
        }

        public removeLineToken () {
            if(!this._diagram?.selectedLine) {
                return;
            }
            let idString = this._diagram.selectedLine.id;

            this._diagram.lines.find(line => line.id === idString)!.tokens--;

            if(this._diagram.lines.find(line => line.id === idString)!.tokens  < 1) {
                this._diagram.lines.find(line => line.id === idString)!.tokens = 1;
            }

            if(this._diagram.lines.find(line => line.id === idString)!.tokens  > 1) {
                this._diagram.lines.find(line => line.id === idString)!.svgElement!.childNodes[3].textContent =
                    this._diagram.lines.find(line => line.id === idString)!.tokens.toString();
            } else {
                this._diagram.lines.find(line => line.id === idString)!.svgElement!.childNodes[3].textContent = "";
            }

            return;
        }

}
