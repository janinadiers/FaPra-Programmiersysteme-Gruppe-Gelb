import { Injectable } from '@angular/core';
import {SvgService} from "./svg.service";
import {Diagram} from "../classes/diagram/diagram";
import {DisplayService} from "./display.service";
import {Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MarkenspielService {
    private _diagram: Diagram | undefined;
    private _sub: Subscription;

    constructor(
        private svgService: SvgService,
        private diplayService: DisplayService) {
        this._sub = this.diplayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
            })
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

            let idNumber = +this._diagram.selectedCircle.id.charAt(1);
            this._diagram.places[idNumber].svgElement?.setAttribute('stroke','red');

            return this._diagram?.selectedCircle?.id
        }

        public getCircleToken() {
            if(!this._diagram?.selectedCircle){
                return;
            }

            let idNumber = +this._diagram.selectedCircle?.id.charAt(1);

            return this._diagram?.places[idNumber].amountToken.toString();
        }

        public addCircleToken() {
            if(!this._diagram?.selectedCircle){
                return;
            }

            let idNumber = +this._diagram.selectedCircle.id.charAt(1);
            this._diagram.places[idNumber].amountToken++;
            this._diagram.places[idNumber].svgElement!.children[1].textContent =
                this._diagram.places[idNumber].amountToken.toString();

            return;
        }

        public removeCircleToken() {
            if(!this._diagram?.selectedCircle) {
                return;
            }

            let idNumber = +this._diagram?.selectedCircle?.id.charAt(1);
            this._diagram.places[idNumber].amountToken--;

            if(this._diagram.places[idNumber].amountToken  < 0) {
                this._diagram.places[idNumber].amountToken = 0;
            }

            this._diagram.places[idNumber].svgElement!.children[1].textContent =
                this._diagram.places[idNumber].amountToken.toString();

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

            let idNumber = +this._diagram.selectedLine.id.charAt(1);
            this._diagram.lines[idNumber].svgElement?.setAttribute('stroke','blue');

            return this._diagram?.selectedLine?.id;
        }

        public getLineToken() {
            if(!this._diagram?.selectedLine){
                return;
            }

            let idNumber = +this._diagram.selectedLine.id.charAt(1);

            return this._diagram.lines[idNumber].tokens;
        }

        public addLineToken() {
            if(!this._diagram?.selectedLine){
                return;
            }

            let idNumber = +this._diagram.selectedLine.id.charAt(1);
            this._diagram.lines[idNumber].tokens++;

            this._diagram.lines[idNumber].svgElement!.childNodes[3].textContent =
                this._diagram.lines[idNumber].tokens.toString();

            return;
        }

        public removeLineToken () {
            if(!this._diagram?.selectedLine) {
                return;
            }

            let idNumber = +this._diagram.selectedLine.id.charAt(1);
            this._diagram.lines[idNumber].tokens--;

            if(this._diagram.lines[idNumber].tokens  < 1) {
                this._diagram.lines[idNumber].tokens = 1;
            }

            this._diagram.lines[idNumber].svgElement!.childNodes[3].textContent =
                this._diagram.lines[idNumber].tokens.toString();

            return;
        }
}
