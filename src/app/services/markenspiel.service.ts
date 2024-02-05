import {Injectable} from '@angular/core';
import {Diagram} from "../classes/diagram/diagram";
import {DisplayService} from "./display.service";
import {Transition} from "../classes/diagram/transition";
import {Place} from "../classes/diagram/place";
import {Line} from "../classes/diagram/line";
import {coerceStringArray} from "@angular/cdk/coercion";
import {transition} from "@angular/animations";

@Injectable({
    providedIn: 'root'
})

export class MarkenspielService {

    private _diagram: Diagram | undefined;
    private currentActiveTransitions = new Map;
    private alreadyUsedParents = new Map;
    private multitasking: boolean = false;
    private roundTripMap = new Map;

    constructor(
        private diplayService: DisplayService) {
        this.diplayService.diagram$.subscribe(diagram => {
            this._diagram = diagram;
        });
    }

    currentChosenTransitions: Array<Transition> = [];
    processChosing: boolean = false;
    randomStep: boolean = false;

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
        this.currentChosenTransitions.splice(0,this.currentChosenTransitions.length);
        this.currentActiveTransitions.clear();
        this.alreadyUsedParents.clear();

        this._diagram?.transitions.forEach((transition) => {
            transition.isActive = false;
            this.setTransitionColor(transition, 'black');
        });
    }

    // ############### Random Maximum Step #####################################
    public showAll(){
        // 1. Aufräumen und Hilfsvariablen erstellen
        this.cleanUp();

        let transitions = this.getPossibleActiveTransitions(); // alle schaltbaren Transitionen holen
        const lines = this._diagram?.lines; // alle Kanten holen

        // 2. Zeigen des Schrittes
        transitions.forEach((transition) => {
            lines?.find(line => line.source.id === transition.id);
            transition.isActive = true;
            this.setTransitionColor(transition, 'green');
        });

        return transitions;
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

            // else: Marken noch aufteilen
        });

        // 4. Zeigen des Schrittes
        this.currentChosenTransitions?.forEach((transition) => {
            lines?.find(line => line.source.id === transition.id);
            transition.isActive = true;
            this.setTransitionColor(transition, 'violet');
        });

        return;
    }

    // ####################### Schritte editieren ######################################
    public editStep() {
        // Aufruf zum Erstellen eines Schrittes
        this.cleanUp();
        this.alreadyUsedParents.clear();
        this.currentChosenTransitions = [];

        // parents nach Anzahl der Marken sortieren
        this._diagram?.transitions.forEach((element) => {
            let parents = element.parents;

            parents.sort(function(a,b) {
                return a.amountToken - b.amountToken;
            });
        });

        // console.log("edit step");
        // console.log("current chosen transitions");
        // console.log(this.currentChosenTransitions);
        // console.log("already used parents");
        // console.log(this.alreadUsedParents);

        let currentTransitions = this.showAll();

        currentTransitions.forEach((element) => {
           element.svgElement?.addEventListener(('dblclick'),  (choseElement) => {
               this.choseElement(element);
           });

           this.smallCleanUp(element,element.parents);
        });

        return;
    }

    public choseElement(element: Transition) {
        // Auswahl einer Transition für den Schritt
        let parents = element.parents;

        parents.sort(function(a,b) {
            return a.amountToken - b.amountToken;
        });

        if(!this.multitasking){
            this.simpleStep(element);
            this.resetColor();
            // console.log("simple step");
        }
        else {
            this.multiStep(element);
            this.resetColor();
            // console.log("multitasking");
        }

        return;
    }

    // ####################### Schritte auslösen ############################################################
    public fireStep() {
        this.currentChosenTransitions.forEach((transition) => {
            this.fireSingleTransition(transition);
        });

        if(this.randomStep == true){
            this.showStep();
        }
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

    // #################### Einfache Schritte ##################################
    private simpleStep(element: Transition) {
        // Überprüfung der Vorbedingungen und ggf. Hinzufügen der Transition zum Schritt
        if(this.checkParents(element) && this.processChosing){
            if(!this.currentChosenTransitions.includes(element)){
                let parents = element.parents;
                let lines = this._diagram!.lines;
                let localTokenArray: number[] = [];
                let transitionIsStillActive: boolean = false;

                parents.sort(function(a,b) {
                    return a.amountToken - b.amountToken;
                });

                parents.forEach((parent) => {
                    let parentToken = this.alreadyUsedParents.get(parent.id);
                    localTokenArray.push(parentToken);
                    // console.log(parent.id+" mit insgesamt "+parent.amountToken);
                    // console.log(parent.id+" hat gerade "+parentToken);
                });

                // console.log(localTokenArray);
                if(!localTokenArray.includes(0)) {
                    // a) Berechnen der neuen Markenanzahl für alle Stellen
                    parents.forEach((parent) => {
                        let result = lines?.find(line => line.target.id === element.id && line.source.id === parent.id);
                        let idString = result!.id.split(',')![0];
                        // result: eingehende Kante, idString: Stelle, die vor der Kante steht (dazugehörige parent.id)

                        if (this.alreadyUsedParents.has(idString) && this.alreadyUsedParents.get(idString) - result!.tokens >= 0) {
                            let oldTokenAmount = this.alreadyUsedParents.get(idString);
                            let newTokenAmount = oldTokenAmount - result!.tokens;

                            this.alreadyUsedParents.set(idString, newTokenAmount);
                            transitionIsStillActive = true;
                            // console.log(parent.id+" hatte vorher: "+oldTokenAmount+" und hat jetzt "+newTokenAmount);

                        } else {
                            if(!this.alreadyUsedParents.has(idString) && parent.amountToken - result!.tokens >= 0){
                                let newTokenAmount = parent.amountToken - result!.tokens;

                                this.alreadyUsedParents.set(idString, newTokenAmount);
                                transitionIsStillActive = true;
                            }
                        }
                    });

                    // b) Hinzufügen der Transition zum Schritt
                    if(transitionIsStillActive){
                        this.currentChosenTransitions.push(element);
                        this.setTransitionColor(element,'violet');
                    }
                } else {
                    this.setTransitionColor(element, 'black');
                }
            }
        }

        return;
    }

    // #################### Auto- Concurrency ##################################
    public multitaskingTransitions(multitasking: boolean) {
        // Aufruf zum Aktivieren von Auto-Cun-Currency
        this.multitasking = multitasking;
        // console.log(multitasking);

        this.editStep();
        // Wenn in der Stelle vor der Transition genug Marken sind, kann die Transition so oft schalten, wie ihr
        // kleinstes Parent Marken hat
    }

    // Auto-Concurrency
    private multiStep(element: Transition) {
        let lines = this._diagram?.lines;
        let parents = element.parents;
        let number = this.setmultitaskingNumber(element);

        if(this.processChosing){

            parents.forEach((parent) => {
                let result = lines?.find(line => line.target.id === element.id && line.source.id === parent.id);
                let lineTokens = result!.tokens;
                let newTokenAmount;

                if(this.alreadyUsedParents.has(parent.id)){
                    let oldTokenAmount = this.alreadyUsedParents.get(parent.id);
                    newTokenAmount = oldTokenAmount - lineTokens*number
                    // console.log("new Token Amount: "+newTokenAmount)
                } else {
                    newTokenAmount = parent.amountToken - lineTokens*number;
                    // console.log("new Token Amount/else: "+newTokenAmount)
                }

                this.alreadyUsedParents.set(parent.id, newTokenAmount);

            });

            while(number > 0){
                this.currentChosenTransitions.push(element);
                number = number - 1;
            }

            this.currentChosenTransitions.forEach((transition) => {
                this.setTransitionColor(transition,'orange');
            });
            // console.log(this.currentChosenTransitions);
        }

        // this.resetColor();

        return;
    }

    private setmultitaskingNumber(element: Transition) {
        let multitaskingNumber = 1000;
        let localMap = new Map;
        let localLineMap = new Map;
        let parents = element.parents;
        let lines = this._diagram?.lines;

        parents.forEach((parent) => {
            let result = lines?.find(line => line.target.id === element.id && line.source.id === parent.id);
            let lineTokens = result!.tokens;

            if(this.alreadyUsedParents.has(parent.id)){
                localMap.set(parent.id, this.alreadyUsedParents.get(parent.id));
            } else {
                localMap.set(parent.id, parent.amountToken);
            }

            localLineMap.set(parent.id,lineTokens);
        });

        // console.log(localMap);
        // console.log(localLineMap);

        localLineMap.forEach((lineToken) => {
            localMap.forEach((parentToken) => {
                if( parentToken/lineToken < multitaskingNumber){
                    multitaskingNumber = Math.floor(parentToken/lineToken);
                }
            });
        });

        // console.log("Number: "+multitaskingNumber);
        if(multitaskingNumber != 0){
            console.log("Transition "+element.id+" schaltet "+multitaskingNumber+" mal.");
        }

        return multitaskingNumber;
    }

    // ########################### Setzen der Farben ################################################################
    private resetColor() {
        let transitions = this.getPossibleActiveTransitions();

        transitions.forEach((transition) => {
            let parents = transition.parents;

            if(!this.currentChosenTransitions.includes(transition)){
                parents.forEach((parent) => {

                    if(this.alreadyUsedParents.has(parent.id)){
                        this.disableOtherTransitions(parent,transition);
                    }

                    if(this.multitasking){
                        if(this.alreadyUsedParents.has(parent.id) && this.alreadyUsedParents.get(parent.id) == 1){
                            this.disableMultitasking(parent,transition);
                        }
                    }
                });
            }
        });
    }

    private disableOtherTransitions(parent: Place, element: Transition) {
        let lines = this._diagram?.lines;
        let transitions: Transition[] = this._diagram!.transitions;
        let outGoingLines = lines?.filter(line => line.source.id === parent.id );

        outGoingLines!.forEach((outGoingLine) => {
            let elem = outGoingLine.target;
            let rect: Transition = transitions!.find(rect => elem.id == rect.id)!;

            if(outGoingLine.tokens > this.alreadyUsedParents.get(parent.id) && !this.currentChosenTransitions.includes(rect)){
                this.setTransitionColor(rect, 'black');
            }
        });
    }

    disableMultitasking(parent: Place, element: Transition){

        let lines = this._diagram?.lines;
        let transitions: Transition[] = this._diagram!.transitions;
        let outGoingLines = lines?.filter(line => line.source.id === parent.id );

        outGoingLines!.forEach((outGoingLine) => {
            let elem = outGoingLine.target;

            if(element.id != elem.id){
                let rect: Transition = transitions!.find(rect => elem.id == rect.id)!;

                if(!this.currentChosenTransitions.includes(rect) && outGoingLine.tokens > 1){
                    this.setTransitionColor(rect, 'black');
                }
            }
        });
    }

    // ##################### Hilfsmethoden ##########################################
    private smallCleanUp(element: Transition, parents: Place[]) {
        let deleteCount = parents[0].amountToken;
        let isChosen: boolean = false;

        if(element == this._diagram?.selectedRect){
            isChosen = true;
        } else {
            isChosen = false;
        }

        if(this.currentChosenTransitions.includes(element) && !isChosen){
            while(deleteCount > 0){

                let deleteElement = this.currentChosenTransitions.indexOf(element);
                this.currentChosenTransitions.splice(deleteElement);

                let possibleTransitions = this.getPossibleActiveTransitions();
                if(possibleTransitions.includes(element)){
                    this.setTransitionColor(element, 'green');
                } else {
                    this.setTransitionColor(element,'black');
                }

                deleteCount--;
            }
        }
    }

    private checkParents(element: Transition): boolean {
        let parentsHaveEnoughTokens: boolean = false;

        let parents = element.parents;
        let lines = this._diagram!.lines;

        parents.forEach((parent) => {
            let result = lines?.find(line => line.target.id === element.id && line.source.id === parent.id);
            let idString = result!.id.split(',')![0];
            // result: eingehende Kante, idString: Stelle, die vor der Kante steht (dazugehörige parent.id)

            if (this.alreadyUsedParents.has(idString) && this.alreadyUsedParents.get(idString) - result!.tokens >= 0){
                parentsHaveEnoughTokens = true;
            } else if (!this.alreadyUsedParents.has(idString) && parent.amountToken - result!.tokens >= 0) {
                parentsHaveEnoughTokens = true;
            } else {
                parentsHaveEnoughTokens = false;
            }
        });

        return parentsHaveEnoughTokens;
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

    public random(random: boolean){
        this.randomStep = random;
    }

    // Zusatzmethoden, aktuell nicht genutzt
    private getOccurence(array: Transition[], value: any) {
        return array.filter((v) => (v === value)).length;
    }

    private checkOnRoundTrips() {
        // sich im Kreis bewegende Marken erkennen
        // eingehende und ausgehende Kante holen
        // wenn gleich, dann ist maximales Count bei choseElement die Anzahl der Token in der dazugehörigen Stelle

        let allTransitions = this._diagram?.transitions;
        let lines = this._diagram!.lines;

        allTransitions?.forEach((transition) => {
            let parents = transition.parents;

            parents.forEach((parent) => {
                let inComingLine = lines!.find(line => line.target.id === transition.id && line.source.id === parent.id);
                let outGoingLine = lines!.find(line => line.source.id === transition.id && line.target.id === parent.id);

                if(inComingLine?.tokens == outGoingLine?.tokens){
                    this.roundTripMap.set(parent.id,parent.amountToken);
                }
            });
        });

        console.log(this.roundTripMap);
    }
}
