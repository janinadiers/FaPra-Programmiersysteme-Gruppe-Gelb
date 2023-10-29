import { map } from 'rxjs';
import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';
import { ImportService } from '../classes/import-service';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';
import { Diagram } from '../classes/diagram/diagram';

@Injectable({
    providedIn: 'root',
})
export class PnmlImportService implements ImportService {

    import(content: string): Diagram | undefined {
        // TODO: implement transitions and arcs
        let rawData = new DOMParser().parseFromString(content, 'text/xml');
        const places = rawData.querySelectorAll('place');
        const placeIds: Array<string> = Array.from(places)
            .map((place) => {
                return place.getAttribute('id');
            })
            .filter((id): id is string => id !== null);

        let layout: JsonPetriNet['layout'] = {};
        this.setLayout(places, layout);

        const elements = this.parseElements(placeIds);
        this.setPosition(elements, layout);

        return new Diagram(elements);
    }

    private setLayout(places: NodeListOf<globalThis.Element>, layout: JsonPetriNet['layout']){
        places.forEach((place) => {
            const id = place.getAttribute('id');
            const graphics = Array.from(place.children).filter(
                (child) => child.tagName == 'graphics'
            );
            const position = Array.from(graphics[0].children).filter(
                (child) => child.tagName == 'position'
            );
            const x = position[0].getAttribute('x');
            const y = position[0].getAttribute('y');

            if (!id || !x || !y) return;
            if (!layout) layout = {};

            layout[id] = { x: parseInt(x), y: parseInt(y) };
        });
    }

    private parseElements(placeIds: Array<string> | undefined): Array<Element> {
        if (placeIds === undefined || !Array.isArray(placeIds)) {
            return [];
        }
        return placeIds.map((pid) => new Element(pid));
    }

    private setPosition(
        elements: Array<Element>,
        layout: JsonPetriNet['layout']
    ): void {
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
