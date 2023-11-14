import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Element } from '../classes/diagram/element';
import { Line } from '../classes/diagram/line';
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

        elements.forEach(element => {
            result.push(element);
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

        const elements = this.getElements();
        const lines = this.getLines();

        elements.forEach(element => {
            //check if svgElement is place
            if (element.svgElement?.nodeName.match('circle'))
                petriNet.places.push(element.id);
            //check if svgElement is transition
            if (element.svgElement?.nodeName.match('rect'))
                petriNet.transitions.push(element.id);

            //set coordinates of either place or transition
            petriNet.layout![element.id] = { x: element.x, y: element.y }

        });

        //Both versions for saving lines are possible and legit with example.json (discussion with Group and/or Stakeholder needed)
        lines.forEach(line => {
            petriNet.layout![`${line.source.id},${line.target.id}`] = [{ x: line.source.x, y: line.source.y },{ x: line.target.x, y: line.target.y }]
            // petriNet.layout![`${line.source.id},${line.target.id}`] = { x: line.source.x, y: line.source.y }
            // petriNet.layout![`${line.target.id},${line.source.id}`] = { x: line.target.x, y: line.target.y }
        })

        var jsonString = JSON.stringify(petriNet);

        this.downloadService.downloadFile(jsonString, 'petriNetz.json', 'application/json');
    }
}
