
import { Injectable } from '@angular/core';
import { Element } from '../classes/diagram/element';
import { ImportService } from '../classes/import-service';
import { Diagram } from '../classes/diagram/diagram';
import { SvgService } from './svg.service';

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
        let arcs = this.importArcs(rawData);
       
        return new Diagram([...places, ...transitions, ...arcs]);
      
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

    importArcs(rawData: Document): Array<Element> {
        const arcs = rawData.querySelectorAll('arc');
        const result:Array<Element> = []
        arcs.forEach((arc) => {
            const arcId = arc.getAttribute('id');
            const arcPosition = this.getEdgePosition(arc);
            if(!arcId) throw new Error('Arc element misses id: ' + arc);
            const arcElement = this.createEdge(arcId, arcPosition.x, arcPosition.y, arcPosition.x2, arcPosition.y2);
            result.push(arcElement);
        });
       return result;
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
            

           return { x: parseInt(x), y: parseInt(y) };
        
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
        

       return { x: parseInt(x), y: parseInt(y) };
    }
    private getEdgePosition(element:globalThis.Element):{x:number, y:number, x2:number, y2:number}{
        
        const graphics = Array.from(element.children).filter(
            (child) => child.tagName == 'graphics'
        );
            
        const positions = Array.from(graphics[0].children).filter(
            (child) => child.tagName == 'position'
        );
        const x = positions[0].getAttribute('x');
        const y = positions[0].getAttribute('y');
        const x2 = positions[1].getAttribute('x');
        const y2 = positions[1].getAttribute('y');
       
       
        if(!x || !y || !x2 || !y2) throw new Error('Arc element misses positional attribute: ' + element );
        return { x: parseInt(x), y: parseInt(y), x2: parseInt(x2), y2: parseInt(y2) };
       
    }


    private createPlace(id:string, x:number, y:number): Element {
        const element = new Element(id);
        element.x = x;
        element.y = y;
        element.svgElement = this._svgService.createSvgCircleForElement(element);
        return element;
       

    }

    private createTransition(id:string, x:number, y:number): Element {
        const element = new Element(id);
        element.x = x;
        element.y = y;
        element.svgElement = this._svgService.createSvgRectangleForElement(element);
        return element;
       

    }

    private createEdge(id:string, x:number, y:number, x2:number, y2:number): Element {
        const element = new Element(id);
        element.x = x;
        element.y = y;
        element.x2 = x2;
        element.y2 = y2;
        element.svgElement = this._svgService.createSvgLineForElement(element);
        return element;
      

    }


}
