import { Injectable } from '@angular/core';
import { Diagram } from '../classes/diagram/diagram';
import { Element } from '../classes/diagram/element';
import { Line } from '../classes/diagram/line';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';

@Injectable({
    providedIn: 'root'
})
export class ParserService {

    constructor() {
    }

    parse(text: string): Diagram | undefined {
        try {
            const rawData = JSON.parse(text) as JsonPetriNet;

            const places = this.parseElements(rawData['places']);
            const transitions = this.parseElements(rawData['transitions']);

            //Concatenate both Element-Objects
            const elements = [...places, ...transitions];
           
            //Set coordinates of places and transitions
            this.setPosition(elements, rawData['layout']);

            //Set Lines from Layout Array
            const lines = this.setLines(elements, rawData['layout']);

            return new Diagram(elements, lines);
        } catch (e) {
            console.error('Error while parsing JSON', e, text);
            return undefined;
        }
    }

    private parseElements(placeIds: Array<string> | undefined): Array<Element> {
        if (placeIds === undefined || !Array.isArray(placeIds)) {
            return [];
        }

        //Create temporary Element-Object without coords
        return placeIds.map(pid => new Element(pid));
    }

    private setLines(elements: Array<Element>,layout: JsonPetriNet['layout']): Array<Line> {
        const lines: Array<Line> = [];

        if (layout) {
            for (const pid in layout) {
                const coords = layout[pid];
                //Check if layout has Array -> Array indicates line coordinates
                if (Array.isArray(coords)) {
                    const elements: Array<Element> = [];
                    coords.forEach(coord => {
                        elements.push(new Element(pid, coord.x, coord.y));
                    })
                    lines.push(new Line(pid, elements[0], elements[1]));
                }
            }
        }

        return lines;
    }

    private setPosition(elements: Array<Element>,layout: JsonPetriNet['layout']) {
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
