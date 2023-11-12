import {Injectable, OnInit, Output} from '@angular/core';
import {SvgElementService} from "./svg-element.service";

@Injectable({
    providedIn: 'root',
})

// To-Do: get-ItemId so anpassen, dass es dynamisch auf angeklickte Elemente reagiert
// Verhalten bisher: Nachdem p* geklickt wurde ändert sich nichts mehr - auch nicht bei Klcik auf a*


export class MarkenspielService {

    constructor(
        private svgElementService: SvgElementService,
    ) {}

    // Id des angeklickten Items anzeigen
    public getItemId() {
        var itemId = "Item-Id";
        if(this.svgElementService.selectedLine) {
            let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
            itemId = 'a'+id;
            console.log("Gewichte vorher: "+this.svgElementService.selectedLineObjectArray[id].tokens);
        }
        if(this.svgElementService.selectedCircle){
            let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
            itemId = 'p'+id;
            console.log("Marken vorher: "+this.svgElementService.selectedCircleObjectArray[id].amountToken);
        }
        return itemId;
    }

    // Marken oder Gewichte abfragen
    public getCount() {
        let count: number = 0;
        if(this.svgElementService.selectedCircle?.id.startsWith('p')) {
            let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
            count = this.svgElementService.selectedCircleObjectArray[id].amountToken;
        }
        if(this.svgElementService.selectedLine?.id.startsWith('a')) {
            let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
            count = this.svgElementService.selectedLineObjectArray[id].tokens;
        }
        return count;
    }

    // Marken oder Gewichte um 1 hochzählen ("+" Button)
    public addCount(mouseEvent: MouseEvent) {
        // Marken hochzählen
        if(this.svgElementService.selectedCircle?.id.startsWith('p')) {
            let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
            this.svgElementService.selectedCircleObjectArray[id].amountToken++;

            console.log("Marken nachher p"+id+": "+this.svgElementService.selectedCircleObjectArray[id].amountToken);
        }
        // Gewichte hochzählen
        if(this.svgElementService.selectedLine?.id.startsWith('a')){
            let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
            this.svgElementService.selectedLineObjectArray[id].tokens++;
        }
        return;
    }

    // Marken oder Gewichte um 1 runterzählen ("-" Button)
    public removeCount(mouseEvent: MouseEvent) {
        if(this.svgElementService.selectedCircle?.id.startsWith('p')) {
            let id: number = +this.svgElementService.selectedCircle?.id.charAt(1);
            this.svgElementService.selectedCircleObjectArray[id].amountToken--;
            if(this.svgElementService.selectedCircleObjectArray[id].amountToken < 0) {
                this.svgElementService.selectedCircleObjectArray[id].amountToken = 0;
            }
        }
        if(this.svgElementService.selectedLine?.id.startsWith('a')){
            let id: number = +this.svgElementService.selectedLine?.id.charAt(1);
            this.svgElementService.selectedLineObjectArray[id].tokens--;
            if(this.svgElementService.selectedLineObjectArray[id].tokens < 0) {
                this.svgElementService.selectedLineObjectArray[id].tokens = 0;
            }
        }
        return;
    }
}
