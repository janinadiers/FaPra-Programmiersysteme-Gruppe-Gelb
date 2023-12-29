import {Injectable} from '@angular/core';
import {Diagram} from "../classes/diagram/diagram";
import {DisplayService} from "./display.service";
import {Subscription} from "rxjs";
import {Transition} from "../classes/diagram/transition";
import {transition} from "@angular/animations";
import {Place} from "../classes/diagram/place";
import {Line} from "../classes/diagram/line";

@Injectable({
    providedIn: 'root'
})

export class MarkenspielService {

    private _diagram: Diagram | undefined;

    constructor(
        private diplayService: DisplayService) {
        this.diplayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
        });
    }

    public addCircleToken() {
        if (!this._diagram?.selectedCircle) {
            return;
        }

        this._diagram.selectedCircle.amountToken++;

        this._diagram.selectedCircle.svgElement!.children[1].textContent =
            this._diagram.selectedCircle.amountToken.toString()

        return;
    }

    public removeCircleToken() {
        if (!this._diagram?.selectedCircle) {
            return;
        }
        this._diagram.selectedCircle.amountToken--;

        this._diagram.selectedCircle.svgElement!.children[1].textContent =
            this._diagram.selectedCircle.amountToken.toString()

        if (this._diagram.selectedCircle.amountToken < 0) {
            this._diagram.selectedCircle.amountToken = 0;
        }
        return;
    }

    // Line-Handling
    public addLineToken() {
        if (!this._diagram?.selectedLine) {
            return;
        }
        this._diagram.selectedLine.tokens++;

        this._diagram.selectedLine.svgElement!.childNodes[3].textContent =
            this._diagram.selectedLine!.tokens.toString();

        this._diagram.selectedLine!.svgElement!.querySelector('text')!.setAttribute('stroke', 'blue');

        if (this._diagram.selectedLine!.tokens > 1) {
            this._diagram.selectedLine!.svgElement!.querySelector('circle')!.setAttribute('fill', 'white');
        } else {
            this._diagram.selectedLine!.svgElement!.querySelector('circle')!.setAttribute('fill', 'transparent');
        }

        return;
    }

    public removeLineToken() {
        if (!this._diagram?.selectedLine) {
            return;
        }

        this._diagram.selectedLine.tokens--;

        if (this._diagram.selectedLine.tokens < 1) {
            this._diagram.selectedLine.tokens = 1;
        }

        if (this._diagram.selectedLine.tokens > 1) {
            this._diagram.selectedLine.svgElement!.childNodes[3].textContent =
                this._diagram.selectedLine.tokens.toString();
        } else {
            this._diagram.selectedLine.svgElement!.childNodes[3].textContent = "";
        }

        return;
    }

    public getPossibleStartTransitions(): Array<Transition> {
        const startTransitions: Array<Transition> = [];
        const transitions = this._diagram?.transitions;
        const lines = this._diagram?.lines;

        if (transitions && lines) {
            transitions?.forEach((transition) => {
                const line = lines?.find(line => line.target.id === transition.id);
                if (this.transitionCanBeActivated(transition, line)) {
                    transition.isActive = true;
                    startTransitions.push(transition);
                }
            });
        }

        return startTransitions;
    }

    private transitionCanBeActivated(transition: Transition, line: Line | undefined): boolean {
        return this.parentIsStartpoint(transition.parents) && this.parentsHaveEnoughTokens(transition.parents, line);
    }

    private parentIsStartpoint(places: Array<Place>): boolean {
        return places.some((place) => !place.parents || place.parents.length === 0);
    }

    private parentsHaveEnoughTokens(places: Array<Place>, line: Line | undefined): boolean {
        if(!line) {
            return false;
        }

        return places.every((place) => place.amountToken >= line.tokens);
    }

    /*startTokenGame(): void {
        this._diagram?.transitions.forEach((transition) => {
            this._diagram?.lines.forEach((line) => {
                if (this.isTransitionConnectedToLine(transition, line)) {
                    this.processConnectedTransition(transition, line);
                }
            });
        });
    }

    private isTransitionConnectedToLine(transition: Transition, line: Line): boolean {
        return line.source.id === transition.id /*|| line.target.id === transition.id;
    }

    private processConnectedTransition(transition: Transition, line: Line): void {
        transition.parents.forEach((place) => {
            const amountTokenPlace = place.amountToken;
            const amountTokenLine = line.tokens;

            if (this.hasEnoughTokens(amountTokenPlace, amountTokenLine)) {
                this.setTransitionColor(transition, 'green');
                this.subtractTokensFromPlace(place, amountTokenLine);
            } else {
                this.setTransitionColor(transition, 'black');
            }
        });
    }

    private hasEnoughTokens(amountTokenPlace: number, amountTokenLine: number): boolean {
        return amountTokenPlace >= amountTokenLine;
    }

    private setTransitionColor(transition: Transition, color: string): void {
        transition.svgElement?.querySelector('rect')!.setAttribute('fill', color);
    }

    private subtractTokensFromPlace(place: Place, amountTokenLine: number): void {
        console.log('Vorher: ' + place.amountToken);
        place.amountToken -= amountTokenLine;
        console.log('Nachher: ' + place.amountToken);
        place.svgElement!.childNodes[1].textContent = place.amountToken.toString();
    }*/
}
