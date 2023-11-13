
import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';
import { ImportService } from '../classes/import-service';
import { Diagram } from '../classes/diagram/diagram';
import { SvgService } from './svg.service';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import { Line } from '../classes/diagram/line';

@Injectable({
    providedIn: 'root',
})
export class PnmlImportService implements ImportService {
   
    constructor(private _svgService: SvgService) {}
    import(content: string): Diagram | undefined {
        
        // convert pnml string to DOM object
        let rawData = new DOMParser().parseFromString(content, 'text/xml');
        // get all places as an Element instance from DOM object
        let places = this.importPlaces(rawData);
        // get all transitions as an Element instance from DOM object
        let transitions = this.importTransitions(rawData);
        
        // get all arcs as an Element instance from DOM object
        let arcs = this.importArcs(rawData, [...places, ...transitions]);
       
        return new Diagram([...places, ...transitions], [...arcs]);
      
    }

    importPlaces(rawData: Document): Array<Element> {

        const places:NodeListOf<globalThis.Element> = rawData.querySelectorAll('place');
        const result:Array<Element> = []
        places.forEach((place) => {
            const placePosition = this.getPlacePosition(place);
            const placeId = place.getAttribute('id');
            if(!placeId) throw new Error('Place element misses id: ' + place);
            const placeElement = this.createPlace(placeId, placePosition.x, placePosition.y);
            result.push(placeElement);
        });
       
        
        return result;
    }

    importTransitions(rawData: Document): Array<Element> {
        const transitions = rawData.querySelectorAll('transition');
        const result:Array<Element> = []
        transitions.forEach((transition) => {
            const transitionId = transition.getAttribute('id');
            const transitionPosition = this.getTransitionPosition(transition);
            if(!transitionId) throw new Error('Transition element misses id: ' + transition);
            const transitionElement = this.createTransition(transitionId, transitionPosition.x, transitionPosition.y);
            result.push(transitionElement);
        });
        
        return result;
            
    }

    importArcs(rawData: Document, elements: Element[]): Array<Line> {
        const arcs = rawData.querySelectorAll('arc');
        const lines:Array<Line> = []
        arcs.forEach((arc) => {
            const arcId = arc.getAttribute('id');
            const arcPosition = this.getSourceAndTargetElements(arc, elements);
            if(!arcId) throw new Error('Arc element misses id: ' + arc);
            const arcElement = this.createEdge(arcId, arcPosition.sourceElement, arcPosition.targetElement);
            lines.push(arcElement);
        });
       return lines;
    }


    private getPlacePosition(element: globalThis.Element):{x:number, y:number}{
        
            
            const graphics = Array.from(element.children).filter(
                (child) => child.tagName == 'graphics'
            );
            const positions = Array.from(graphics[0].children).filter(
                (child) => child.tagName == 'position'
            );
            const x = positions[0].getAttribute('x');
            const y = positions[0].getAttribute('y');

            if (!x || !y) throw new Error('Place element misses id or positional attribute: ' + element );
            

           return { x: parseFloat(x), y: parseFloat(y) };
        
    }

    private getTransitionPosition(element:globalThis.Element):{x:number, y:number}{
        const graphics = Array.from(element.children).filter(
            (child) => child.tagName == 'graphics'
        );
        const positions = Array.from(graphics[0].children).filter(
            (child) => child.tagName == 'position'
        );
        const x = positions[0].getAttribute('x');
        const y = positions[0].getAttribute('y');

        if (!x || !y) throw new Error('Transition element misses id or positional attribute: ' + element );
        

       return { x: parseFloat(x), y: parseFloat(y) };
    }
    private getSourceAndTargetElements(element:globalThis.Element, elements:Element[]):{sourceElement:Element, targetElement: Element}{
        
        const source = element.getAttribute('source');
        const target = element.getAttribute('target');
        
        if(!source || !target) throw new Error('Arc element misses source or target attribute: ' + element );
        const sourceElement:Element| undefined = elements.find((element) => element.id == source);
        const targetElement: Element|undefined = elements.find((element) => element.id == target);
       
        if(!sourceElement || !targetElement) throw new Error('Arc element misses source and target attribute: ' + element );

        return { sourceElement, targetElement };
       
    }


    private createPlace(id:string, x:number, y:number): Element {
        const element = new Place(id, x, y);
        element.x = x;
        element.y = y;
        element.svgElement = element.createSVG();
        return element;
       

    }

    private createTransition(id:string, x:number, y:number): Element {
        const element = new Transition(id, x, y);
        element.x = x;
        element.y = y;
        element.svgElement = element.createSVG();
        return element;
       

    }

    private createEdge(id:string, source:Element, target:Element): Line{
        const element:Line = new Line(id, source, target);
        element.createSVG();
        return element;
      
    }


}
