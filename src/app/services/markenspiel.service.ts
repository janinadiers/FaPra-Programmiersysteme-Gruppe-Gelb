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

    public getPossibleActiveTransitions(): Array<Transition> {
        const startTransitions: Array<Transition> = [];
        const transitions = this._diagram?.transitions;
        const lines = this._diagram?.lines;

        if (transitions && lines) {
            transitions?.forEach((transition) => {
                const line = lines?.find(line => line.target.id === transition.id);
                if (this.parentsHaveEnoughTokens(transition.parents, line)) {
                    transition.isActive = true;
                    startTransitions.push(transition);
                }
            });
        }

        return startTransitions;
    }

    private parentsHaveEnoughTokens(places: Array<Place>, line: Line | undefined): boolean {
        if (!line) {
            return false;
        }

        return places.every((place) => place.amountToken >= line.tokens);
    }

    public fireTransition(transition: Transition): Array<Transition> {
        const lines = this._diagram?.lines;

        const targetLine = lines?.find(line => line.target.id === transition.id);
        if(!this.parentsHaveEnoughTokens(transition.parents, targetLine)) {
            return this.getPossibleActiveTransitions();
        }

        transition.parents.forEach((place) => {
            const line = lines?.find(line => line.source.id === place.id);
            this.subtractTokensFromPlace(place, line!.tokens);
        });

        transition.children.forEach((place) => {
            const line = lines?.find(line => line.source.id === transition.id && line.target.id === place.id);
            this.addTokensToPlace(place, line!.tokens);
        });

        return this.getPossibleActiveTransitions();
    }

    // Zeigt alle in einem Schritt gleichzeitig möglichen Transitionen
    public showStep() {
        let startTransitions = this.getPossibleActiveTransitions();

        const transitions = this.getPossibleActiveTransitions();
        const lines = this._diagram?.lines;

        let activeTransitions: Transition[] = [];
        let sourcePlaceIds: String[] = [];

        startTransitions.forEach((transition) => {
            const line = lines?.find(line => line.target.id === transition.id);
            let currentSourceID = line!.source.id;

            // Prüfen, ob die Stelle im Vorbereich schon von einer anderen Transition benutzt wurde
            if(!sourcePlaceIds.includes(currentSourceID)){
                activeTransitions.push(transition);
                sourcePlaceIds.push(currentSourceID);
            }
        });

        // Erneutes Setzen der jetzt aktiven Transitionen
        transitions?.forEach((transition) => {
            transition.isActive = false;
            this.setTransitionColor(transition, 'black');
        });

        activeTransitions?.forEach((transition) => {
            lines?.find(line => line.source.id === transition.id);
            transition.isActive = true;
            this.setTransitionColor(transition, 'violet');
        });

        return activeTransitions;
    }

    public fireSingleTransition(element: Transition) {
        const lines = this._diagram?.lines;

        const targetLine = lines?.find(line => line.target.id === element.id);
        if(!this.parentsHaveEnoughTokens(element.parents, targetLine)) {
            return this.getPossibleActiveTransitions();
        }

        element.parents.forEach((place) => {
            const line = lines?.find(line => line.source.id === place.id);
            this.subtractTokensFromPlace(place, line!.tokens);
        });

        element.children.forEach((place) => {
            const line = lines?.find(line => line.source.id === element.id && line.target.id === place.id);
            this.addTokensToPlace(place, line!.tokens);
        });

        this.setTransitionColor(element,'black');

        return;
    }

    private subtractTokensFromPlace(place: Place, amountTokenLine: number): void {
        place.amountToken -= amountTokenLine;
        place.svgElement!.childNodes[1].textContent = place.amountToken.toString();
    }

    private addTokensToPlace(place: Place, amount: number): void {
        place.amountToken += amount;
        place.svgElement!.childNodes[1].textContent = place.amountToken.toString();
    }

    public setTransitionColor(transition: Transition, color: string): void {
        transition.svgElement?.querySelector('rect')!.setAttribute('fill', color);
    }

    public shuffle(startTransitions: Array<Transition>) {
        // startTransitions wird mit dem Fisher-Yates-Shuffle zufällig angeordnet
        let m = startTransitions.length, t, i;

        while(m) {
            i = Math.floor(Math.random()*m--);

            t = startTransitions[m];
            startTransitions[m] = startTransitions[i];
            startTransitions[i] = t;
        }

        return startTransitions;
    }
}
