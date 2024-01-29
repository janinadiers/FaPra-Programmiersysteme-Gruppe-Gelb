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
    private currentActiveTransitions = new Map;
    private alreadUsedParents = new Map;

    constructor(
        private diplayService: DisplayService) {
        this.diplayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
        });
    }

    currentChosenTransitions: Array<Transition> = [];

    // Marken und Gewichte setzen
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

        if (this._diagram.selectedCircle.amountToken <= 0) {
            this._diagram.selectedCircle.amountToken = 0;
            this._diagram.selectedCircle.svgElement!.children[1].textContent = ''
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

        if (this._diagram.selectedLine.tokens <= 1) {
            this._diagram.selectedLine.tokens = 1;
            this._diagram.selectedLine.svgElement!.querySelector('circle')!.setAttribute('fill', 'transparent');
        }

        if (this._diagram.selectedLine.tokens > 1) {
            this._diagram.selectedLine.svgElement!.childNodes[3].textContent =
                this._diagram.selectedLine.tokens.toString();
        } else {
            this._diagram.selectedLine.svgElement!.childNodes[3].textContent = "";
        }

        return;
    }

    // Markenspiel
    public getPossibleActiveTransitions(): Array<Transition> {
        const startTransitions: Array<Transition> = [];
        const transitions = this._diagram?.transitions;
        const lines = this._diagram?.lines;

        if (transitions && lines) {
            transitions?.forEach((transition) => {
                const transitionTargetLines = lines.filter(line => line.target.id === transition.id);

                if (this.parentsHaveEnoughTokens(transition.parents, transitionTargetLines)) {

                    transition.isActive = true;
                    startTransitions.push(transition);
                }
                else {
                    transition.isActive = false;
                }
            });
        }

        let notActiveTransitions = transitions?.filter(transition => !transition.isActive);

        notActiveTransitions?.forEach((transition) => {
            this.setTransitionColor(transition, 'black');
        });

        return startTransitions;
    }

    private parentsHaveEnoughTokens(places: Array<Place>, lines: Array<Line>): boolean {
        if (!lines || lines.length === 0) {
            return false;
        }

        return lines.every((line) => {
            const matchingPlace = places.find(place => place.id === line.source.id);
            return matchingPlace && matchingPlace.amountToken >= line.tokens;
        });
    }

    public fireTransition(transition: Transition): Array<Transition> {
        const lines = this._diagram?.lines;

        const targetLine = lines?.filter(line => line.target.id === transition.id);

        if(!this.parentsHaveEnoughTokens(transition.parents, targetLine!)) {

            return this.getPossibleActiveTransitions();
        }

        transition.parents.forEach((place) => {
            const line = lines?.find(line => line.source.id === place.id && line.target.id === transition.id);

            this.subtractTokensFromPlace(place, line!.tokens);
        });

        transition.children.forEach((place) => {
            const line = lines?.find(line => line.source.id === transition.id && line.target.id === place.id);

            this.addTokensToPlace(place, line!.tokens);
        });

        return this.getPossibleActiveTransitions();
    }

    // Markenspiel mit Schritten
    // Aufräumen: Lokalen Array der gerade aktiven Transitionen leeren und alle Transitionen auf false setzen
    private cleanUp() {
        this.currentChosenTransitions = [];
        this.currentActiveTransitions.clear();
        this.alreadUsedParents.clear();

        this._diagram?.transitions.forEach((transition) => {
            transition.isActive = false;
            this.setTransitionColor(transition, 'black');
        });
    }

    // Zeigt alle in einem Schritt gleichzeitig möglichen Transitionen
    public showStep() {
        // 1. Aufräumen und Hilfsvariablen erstellen
        this.cleanUp();
        let transitions = this.getPossibleActiveTransitions(); // alle schaltbaren Transitionen holen

        const lines = this._diagram?.lines; // alle Kanten holen
        let sourcePlaceIds: String[] = []; // Array für die schon verwendeten Stellen zur Prüfung im Wettbewerbskonflikt

        // 2. Array mischen
        this.shuffle(transitions);

        // 3. Prüfen auf Konflikte
        transitions.forEach((transition) => {
            const line = lines?.find(line => line.target.id === transition.id);
            let currentSourceID = line!.source.id;

            // Prüfen, ob die Stelle im Vorbereich schon von einer anderen Transition benutzt wurde
            if(!sourcePlaceIds.includes(currentSourceID)){
                this.currentChosenTransitions.push(transition);
                sourcePlaceIds.push(currentSourceID);
            }
        });

        // 4. Zeigen des Schrittes
        this.currentChosenTransitions?.forEach((transition) => {
            lines?.find(line => line.source.id === transition.id);
            transition.isActive = true;
            this.setTransitionColor(transition, 'violet');
        });

        return;
    }

    public editStep() {
        this.cleanUp();
        let currentTransitions = this.getPossibleActiveTransitions();


        currentTransitions.forEach((element) => {
           this.currentActiveTransitions.set(element.id,element);
        });

        this.currentActiveTransitions.forEach((element) => {
           this.setTransitionColor(element,'green');
           element.svgElement?.addEventListener(('dblclick'),  () => {
               this.choseElement(element);
           });
        });

        return;
    }

    private choseElement(element: Transition) {
        if(this.checkConsequences(element)){
            this.currentChosenTransitions.push(element);
            this.setTransitionColor(element,'violet');
        }

        // nur Überprüfung der parents, bei nicht aktiv auf false setzen
    }

    checkConsequences(element: Transition) {
        let noConflicts = false;

        let parents = element.parents;
        let lines = this._diagram!.lines;

        parents.forEach( (parent) => {
            let result = lines?.find(line => line.target.id === element.id && line.source.id === parent.id);
            let idString = result!.id.split(',')![0];

        // Überprüfung ggf vom Setzen der alreadUsedParents trennen
            if(!this.alreadUsedParents.has(idString)){
                noConflicts = true;
                this.alreadUsedParents.set(idString, parent.amountToken);
            } else {
                if(parent.amountToken - result!.tokens > 0){
                    noConflicts = true;
                } else {
                    noConflicts = false;
                }
            }
        });

        return noConflicts;
    }

    checkParents(element: Transition) {
        let noConflicts = false;

        let parents = element.parents;
        let lines = this._diagram!.lines;

        parents.forEach( (parent) => {
            let result = lines?.find(line => line.target.id === element.id && line.source.id === parent.id);
            let idString = result!.id.split(',')![0];

            // Überprüfung ggf vom Setzen der alreadUsedParents trennen
            if (!this.alreadUsedParents.has(idString)) {
                noConflicts = true;
            } else {
                if (parent.amountToken - result!.tokens > 0) {
                    noConflicts = true;
                } else {
                    noConflicts = false;
                }
            }
        });

        return noConflicts;
    }

    private fireSingleTransition(element: Transition) {
        const targetLine = this._diagram!.lines?.filter(line => line.target.id === element.id);
        // eingehende Linie holen und prüfen, ob die parents (der Vorbereich) genug Marken haben
        if(!this.parentsHaveEnoughTokens(element.parents, targetLine!)) {
            return;
        }

        element.parents.forEach((place) => {
            const line = this._diagram!.lines?.find(line => line.source.id === place.id && line.target.id === element.id);
            this.subtractTokensFromPlace(place, line!.tokens);
        });

        element.children.forEach((place) => {
            const line = this._diagram!.lines?.find(line => line.source.id === element.id && line.target.id === place.id);
            this.addTokensToPlace(place, line!.tokens);
        });

        this.setTransitionColor(element,'black');

        return;
    }

    public fireStep() {
        this.currentChosenTransitions.forEach((transition) => {
            this.fireSingleTransition(transition);
        });
    }

    private subtractTokensFromPlace(place: Place, amountTokenLine: number): void {

        place.amountToken -= amountTokenLine;

        if(place.amountToken <= 0){
            place.amountToken = 0;
            place.svgElement!.childNodes[1].textContent = '';
        }
        else{
            place.svgElement!.childNodes[1].textContent = place.amountToken.toString();
        }
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
