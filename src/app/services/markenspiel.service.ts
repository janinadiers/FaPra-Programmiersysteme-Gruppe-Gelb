import { Injectable } from '@angular/core';
import { SvgElementService } from "./svg-element.service";

@Injectable({
    providedIn: 'root',
})

// Weiteres Vorgehen hier:
// Gestaltung auf dem Canvas anpassen (ausgewähltes Element rot machen, Zahlen anzeigen)
// lineObjectArray und circleObjectArray im SVG-Element-Service eventuell. auf map umstellen
//  - leichterer und schnellerer Zugriff über key-value-Paare
// Transitionen einbauen

export class MarkenspielService {

    constructor(
        private svgElementService: SvgElementService,
    ) {}

    // ############ Circle-Handling ######################
    // Id anzeigen
    public getCircleItemId() {
        let itemId = "Item-Id";
        if(!this.svgElementService.selectedCircle){
            return;
        }
        let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
        itemId = 'p'+id;

        return itemId;
    }

    // Marken abfragen
    public getCircleCount() {
        let count: number = 0;
        if(!this.svgElementService.selectedCircle?.id.startsWith('p')){
            return;
        }

        let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
        count = this.svgElementService.selectedCircleObjectArray[id].amountToken;

        return count;
    }

    // Marken hochzählen
    public addCircleCount() {
        if(!this.svgElementService.selectedCircle?.id.startsWith('p')) {
            return
        }

        let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
        this.svgElementService.selectedCircleObjectArray[id].amountToken++;

        return;
    }

    // Marken runterzählen
    public removeCircleCount() {
        if(!this.svgElementService.selectedCircle?.id.startsWith('p')) {
            return;
        }

        let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
        this.svgElementService.selectedCircleObjectArray[id].amountToken--;

        if(this.svgElementService.selectedCircleObjectArray[id].amountToken < 0) {
            this.svgElementService.selectedCircleObjectArray[id].amountToken = 0;
        }

        return;
    }

    // ################ Line-Handling ################################
    // Id anzeigen
    public getLineItemId() {
        let itemId = "Item-Id";
        if(!this.svgElementService.selectedLine) {
            return;
        }
        let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
        itemId = 'a'+id;

        return itemId;
    }

    // Gewichte abfragen
    public getLineCount() {
        let count: number = 0;
        if(!this.svgElementService.selectedLine?.id.startsWith('a')) {
            return;
        }
        let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
        count = this.svgElementService.selectedLineObjectArray[id].tokens;

        return count;
    }

    // Gewichte hochzählen
    public addLineCount() {
        if(!this.svgElementService.selectedLine?.id.startsWith('a')){
            return;
        }
        let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
        this.svgElementService.selectedLineObjectArray[id].tokens++;

        return;
    }

    // Gewichte runterzählen
    public removeLineCount() {
        if(!this.svgElementService.selectedLine?.id.startsWith('a')){
            return;
        }

        let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
        this.svgElementService.selectedLineObjectArray[id].tokens--;

        if(this.svgElementService.selectedLineObjectArray[id].tokens < 0) {
            this.svgElementService.selectedLineObjectArray[id].tokens = 0;
        }

        return;
    }
}
