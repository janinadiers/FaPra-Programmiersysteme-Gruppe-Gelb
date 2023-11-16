import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Line } from '../classes/diagram/line';
import { Injectable } from '@angular/core';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';
import {DownloadService} from "./helper/download-service";
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';

@Injectable({
    providedIn: 'root',
})
export class JsonExport implements ExportService{
    constructor(private _displayService: DisplayService,
                private downloadService: DownloadService) {}

    private getPlaces(): Array<Place> {
        const result: Array<Place> = [];

        const elements = this._displayService.diagram.elements;

        elements.forEach(element => {
            if (element.svgElement?.nodeName.match('circle'))
                result.push(new Place(element.id, element.x, element.y));
        })

        return result;
    }

    private getTransitions(): Array<Transition> {
        const result: Array<Transition> = [];

        const elements = this._displayService.diagram.elements;

        elements.forEach(element => {
            if (element.svgElement?.nodeName.match('rect'))
                result.push(new Transition(element.id, element.x, element.y));
        })

        return result;
    }
    
    private getLines(): Array<Line> {
        const result: Array<Line> = [];

        const lines = this._displayService.diagram.lines;

        lines.forEach(line => {
            result.push(line);
        })

        return result;
    }

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

        const places = this.getPlaces();
        const transitions = this.getTransitions();
        const lines = this.getLines();

        places.forEach(place => {
            petriNet.places.push(place.id);

            petriNet.marking![place.id] = place.amountToken;

            petriNet.layout![place.id] = { x: place.x, y: place.y }
        });

        transitions.forEach(transition => {
            petriNet.transitions.push(transition.id);
            
            petriNet.layout![transition.id] = { x: transition.x, y: transition.y }
        });

        lines.forEach(line => {
            petriNet.arcs![`${line.source.id},${line.target.id}`] = line.tokens;
            //if line has coords, save coords within given layout as array
            if (line.coords) {
                const intermediates: Coords[] = [];
                line.coords.forEach(coord => {
                    intermediates.push({x: coord.x, y: coord.y});
                });
                petriNet.layout![`${line.source.id},${line.target.id}`] = intermediates;
            }
        });

        var jsonString = JSON.stringify(petriNet);

        this.downloadService.downloadFile(jsonString, 'petriNetz.json', 'application/json');
    }
}
