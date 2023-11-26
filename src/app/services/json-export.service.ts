import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Injectable } from '@angular/core';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';
import {DownloadService} from "./helper/download-service";

@Injectable({
    providedIn: 'root',
})
export class JsonExport implements ExportService{
    constructor(private _displayService: DisplayService,
                private downloadService: DownloadService) {}

    export(): void {
        //usage of given Json interface for PetriNet
        const petriNet: JsonPetriNet = {
            places: [],
            transitions: [],
            arcs: {},
            actions: [],
            labels: {},
            marking: {},
            layout: {}
          };

        this._displayService.diagram.places.forEach(place => {
            petriNet.places.push(place.id);

            if (place.amountToken > 0)
                petriNet.marking![place.id] = place.amountToken;

            petriNet.layout![place.id] = { x: place.x, y: place.y }
        });

        this._displayService.diagram.transitions.forEach(transition => {
            petriNet.transitions.push(transition.id);
            
            petriNet.layout![transition.id] = { x: transition.x, y: transition.y }
        });

        this._displayService.diagram.lines.forEach(line => {
// vorübergehend auskommentiert            petriNet.arcs![`${line.source?.id},${line.target?.id}`] = line.tokens;
            //if line has coords, save coords within given layout as array
            if (line.coords) {
                const intermediates: Coords[] = [];
                line.coords.forEach(coord => {
                    intermediates.push({x: coord.x, y: coord.y});
                });
// vorübergehend auskommentiert                petriNet.layout![`${line.source?.id},${line.target?.id}`] = intermediates;
            }
        });

        var jsonString = JSON.stringify(petriNet);

        this.downloadService.downloadFile(jsonString, 'petriNetz.json', 'application/json');
    }
}
