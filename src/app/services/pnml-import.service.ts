
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
        
        let rawData = new DOMParser().parseFromString(content, 'text/xml');
        let places = this.importPlaces(rawData);
        let transitions = this.importTransitions(rawData);
        let arcs = this.importArcs(rawData);
        for (const arc of arcs) {
            this.setArcPositions([...places, ...transitions], arc);
        }
        
        

        return new Diagram([...places, ...transitions, ...arcs]);
    }

    importPlaces(rawData: Document): Array<Element> {
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
        return elements;
    }

    importTransitions(rawData: Document): Array<Element> {
        const transitions = rawData.querySelectorAll('transition');
        const transitionIds: Array<string> = Array.from(transitions)
            .map((transition) => {
                return transition.getAttribute('id');
            })
            .filter((id): id is string => id !== null);

        let layout: JsonPetriNet['layout'] = {};
        this.setLayout(transitions, layout);
        const elements = this.parseElements(transitionIds);
        this.setPosition(elements, layout);
        return elements;
    }

    importArcs(rawData: Document): Array<Element> {
        const arcs = rawData.querySelectorAll('arc');
        const arcIds: Array<string> = Array.from(arcs)
            .map((arc) => {
                return arc.getAttribute('id');
            })
            .filter((id): id is string => id !== null);
        
        let layout: JsonPetriNet['arcs'] = {};
        this.setArcs(arcs, layout);
        const elements = this.parseElements(arcIds);
        
        return elements;
    }

  
    private setArcPositions(elements: Array<Element>, arcElement: Element){
           
            const id = arcElement.id;
            const source = id.split(",")[0].trim();
            const target = id.split(",")[1].trim();
            const sourceElement = elements.filter((el) => el.id == source)[0];
            const targetElement = elements.filter((el) => el.id == target)[0];
            
            if(sourceElement && targetElement){
                arcElement.x = sourceElement.x;
                arcElement.y = sourceElement.y;
                arcElement.x2 = targetElement.x;
                arcElement.y2 = targetElement.y;
            }    
        
    }
    private setArcs(arcs: NodeListOf<globalThis.Element>, layout: JsonPetriNet['arcs']){
            arcs.forEach((arc) => {
                const graphics = Array.from(arc.children).filter(
                    (child) => child.tagName == 'graphics'
                );

                const inscription = Array.from(graphics[0].children).filter(
                    (child) => child.tagName == 'inscription'
                );
                let weight = Array.from(inscription[0].children).filter(
                    (child) => child.tagName == 'text'
                );
                const weightContent = weight[0].innerHTML;
                const source = arc.getAttribute('source');
                const target = arc.getAttribute('target');
                
                
                if (!layout) layout = {};

                layout[`${source}, ${target}`] =  parseInt(weightContent);
            });
    }

    private setLayout(elements: NodeListOf<globalThis.Element>, layout: JsonPetriNet['layout']){
        elements.forEach((element) => {
            const id = element.getAttribute('id');
            const graphics = Array.from(element.children).filter(
                (child) => child.tagName == 'graphics'
            );
            const positions = Array.from(graphics[0].children).filter(
                (child) => child.tagName == 'position'
            );
            const x = positions[0].getAttribute('x');
            const y = positions[0].getAttribute('y');

            if (!id || !x || !y) return;
            if (!layout) layout = {};

            layout[id] = { x: parseInt(x), y: parseInt(y) };
        });
    }

    

    private parseElements(elementIds: Array<string> | undefined): Array<Element> {
        if (elementIds === undefined || !Array.isArray(elementIds)) {
            return [];
        }
        return elementIds.map((pid) => new Element(pid));
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
