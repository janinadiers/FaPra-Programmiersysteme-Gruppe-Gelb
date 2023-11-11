import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Element } from '../classes/diagram/element';
import { Injectable } from '@angular/core';
import { JsonPetriNet } from '../classes/json-petri-net';
import {DownloadService} from "./helper/download-service";

@Injectable({
    providedIn: 'root',
})
export class JsonExport implements ExportService{
    constructor(private _displayService: DisplayService,
                private downloadService: DownloadService) {}

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

        this.downloadService.downloadFile(jsonString, 'petriNetz.json', 'application/json');
    }
}
