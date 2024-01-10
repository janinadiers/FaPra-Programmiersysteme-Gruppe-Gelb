import {Injectable} from '@angular/core';
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
        private diplayService: DisplayService) {
            this._sub = this.diplayService.diagram$.subscribe(diagram => {
                this._diagram = diagram;
            });
        }

        public addCircleToken() {
            if(!this._diagram?.selectedCircle){
                return;
            }
            
            this._diagram.selectedCircle.amountToken++;

            this._diagram.selectedCircle.svgElement!.children[1].textContent =
                this._diagram.selectedCircle.amountToken.toString()

            return;
        }

        public removeCircleToken() {
            if(!this._diagram?.selectedCircle) {
                return;
            }
            this._diagram.selectedCircle.amountToken--;

            this._diagram.selectedCircle.svgElement!.children[1].textContent =
                this._diagram.selectedCircle.amountToken.toString()

            if(this._diagram.selectedCircle.amountToken  < 0) {
                this._diagram.selectedCircle.amountToken = 0;
            }
            return;
        }

        // Line-Handling
        public addLineToken() {
            if(!this._diagram?.selectedLine){
                return;
            }
            this._diagram.selectedLine.tokens++;

            this._diagram.selectedLine.svgElement!.childNodes[3].textContent =
                this._diagram.selectedLine!.tokens.toString();

            this._diagram.selectedLine!.svgElement!.querySelector('text')!.
             setAttribute('stroke', 'blue');

            if(this._diagram.selectedLine!.tokens > 1){
                this._diagram.selectedLine!.svgElement!.querySelector('circle')!.
                setAttribute('fill', 'white');
            } else {
                this._diagram.selectedLine!.svgElement!.querySelector('circle')!.
                setAttribute('fill', 'transparent');
            }

            return;
        }

        public removeLineToken () {
            if(!this._diagram?.selectedLine) {
                return;
            }

            this._diagram.selectedLine.tokens--;

            if(this._diagram.selectedLine.tokens  < 1) {
                this._diagram.selectedLine.tokens = 1;
            }

            if(this._diagram.selectedLine.tokens  > 1) {
                this._diagram.selectedLine.svgElement!.childNodes[3].textContent =
                    this._diagram.selectedLine.tokens.toString();
            } else {
                this._diagram.selectedLine.svgElement!.childNodes[3].textContent = "";
            }

            return;
        }

}
