import {Injectable} from '@angular/core';
import {DisplayService} from "../display.service";
import {Place} from "../../classes/diagram/place";
import {Transition} from "../../classes/diagram/transition";
import {Line} from "../../classes/diagram/line";
import {Coords, JsonPetriNet} from "../../classes/json-petri-net";

@Injectable({
    providedIn: 'root'
})
export class JsonExportService {

    constructor(private _displayService: DisplayService) {
    }

    private getPlaces(): Array<Place> {
        return this._displayService.diagram!.places;
    }

    private getTransitions(): Array<Transition> {
        return this._displayService.diagram!.transitions;
    }

    private getLines(): Array<Line> {
        return this._displayService.diagram!.lines;
    }

    export(): string {
        //usage of given Json interface for PetriNet
        const petriNet: JsonPetriNet = {
            places: [],
            transitions: [],
            arcs: {},
            actions: [], //TODO: missing
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

            if (transition.label.length > 0)
                petriNet.labels![transition.id] = transition.label;

            petriNet.layout![transition.id] = { x: transition.x, y: transition.y }
        });

        this._displayService.diagram.lines.forEach(line => {
            petriNet.arcs![`${line.source.id},${line.target.id}`] = line.tokens;
            //if line has coords, save coords within given layout as array
            if (line.coords && line.coords.length > 0) {
                const intermediates: Coords[] = [];
                line.coords.forEach(coord => {
                    intermediates.push({x: coord.x, y: coord.y});
                });
                petriNet.layout![`${line.source.id},${line.target.id}`] = intermediates;
            }
        });

        return JSON.stringify(petriNet);
    }
}
