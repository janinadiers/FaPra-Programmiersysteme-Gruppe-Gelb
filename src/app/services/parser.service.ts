import { Injectable } from '@angular/core';
import { Diagram } from '../classes/diagram/diagram';
import { Element } from '../classes/diagram/element';
import { Line } from '../classes/diagram/line';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';
import { JsonExport } from './json-export.service';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';

@Injectable({
    providedIn: 'root'
})
export class ParserService {

    constructor() {
    }

    parse(text: string): Diagram | undefined {
        try {
            const rawData = JSON.parse(text) as JsonPetriNet;

            const places = this.parsePlaces(rawData['places']);
            const transitions = this.parseTransitions(rawData['transitions']);
            
            const arcs = rawData['arcs'] as JsonPetriNet['arcs'];
           
            //Set coordinates
            this.setPosition(places, rawData['layout']);
            this.setPosition(transitions, rawData['layout']);

            //Set Lines from Layout Array
            const lines = this.setLines(rawData['layout'], places, transitions, arcs)
            

            return new Diagram(places, transitions, lines);
        } catch (e) {
            console.error('Error while parsing JSON', e, text);
            return undefined;
        }
    }

    private parsePlaces(placeIds: Array<string> | undefined): Array<Place> {
        if (placeIds === undefined || !Array.isArray(placeIds)) {
            return [];
        }
        //Create temporary Element-Object without coords
        return placeIds.map(pid => new Place(pid));
    }

    private parseTransitions(transitionIds: Array<string> | undefined): Array<Transition> {
        if (transitionIds === undefined || !Array.isArray(transitionIds)) {
            return [];
        }
        //Create temporary Element-Object without coords
        return transitionIds.map(tid => new Transition(tid));
    }

    private setLines(layout: JsonPetriNet['layout'], places: Array<Place>, transitions: Array<Transition>, arcs: JsonPetriNet['arcs']): Array<Line> {
        const lines: Array<Line> = [];

        if (arcs) {
            // let arcCounter = 0;
            for (const arc in arcs) {
                //sourceTarget[0] -> SourceID || sourceTarget[1] -> TargetID
                const sourceTarget = arc.split(','); 
                if (arc.startsWith('p')) { //Place
                    lines.push(new Line(arc, places.find(pid => pid.id === sourceTarget[0]) as Element, transitions.find(tid => tid.id === sourceTarget[1]) as Element));
                } else { //Transition
                    lines.push(new Line(arc, transitions.find(tid => tid.id === sourceTarget[0]) as Element, places.find(pid => pid.id === sourceTarget[1]) as Element));
                }
                // arcCounter++;
            }
            if (layout) {
                //Loop through layout and check if entry is an array
                for (const pid in layout) {
                    const coords = layout[pid];
                    if (Array.isArray(coords)) {
                        //Loop through each line and search for same id
                        lines.forEach(line => {
                            if (line.id === pid) {
                                //Loop through each found coordinate (intermediate point) and create temporary var
                                const intermediates: Coords[] = [];
                                coords.forEach(coord => {
                                    intermediates.push({x: coord.x, y: coord.y});
                                });
                                //Save temporary var within line to
                                line.coords = intermediates;
                            }
                        });                  
                    }
                }
            }
        }
        return lines;
    }

    private setPosition(elements: Array<Element>, layout: JsonPetriNet['layout']) {
        if (layout === undefined) {
            return;
        }

        for (const el of elements) {
            const pos = layout[el.id] as Coords | undefined;
            if (pos !== undefined) {
                el.x = pos.x;
                el.y = pos.y;
            }
        }
    }
}
