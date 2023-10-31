import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Element } from '../classes/diagram/element';
import { Injectable } from '@angular/core';
import { JsonPetriNet, Coords } from '../classes/json-petri-net';

@Injectable({
    providedIn: 'root',
})
export class JsonExport implements ExportService{
    constructor(private _displayService: DisplayService) {}

    private getElements(): Array<Element> {
        const result: Array<Element> = [];

        const elements = this._displayService.diagram.elements;

        for (const element of elements) {
            result.push(element);
        }
        return result;
    }

    export(): void {
        const petriNet: JsonPetriNet = {
            places: [],
            transitions: [],
            arcs: {},
            actions: [],
            labels: {},
            marking: {},
            layout: {}
          };
        
        const elements = this.getElements();

        elements.forEach(element => {
            petriNet.places.push(element.id);
            petriNet.layout![element.id] = { x: element.x, y: element.y }
        });

        var jsonString = JSON.stringify(petriNet);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Erstellen einer URL für den Blob, um sie als Link zu verwenden.
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Zuweisen der URL zum Link und Festlegen des Dateinamens für den Download.
        a.href = url;
        a.download = 'petriNetz.json';

        // Download starten
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
