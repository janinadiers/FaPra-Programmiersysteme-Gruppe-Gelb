
import { Injectable } from '@angular/core';
import { Element } from '../../classes/diagram/element';
import { Diagram } from '../../classes/diagram/diagram';
import { Place } from '../../classes/diagram/place';
import { Transition } from '../../classes/diagram/transition';
import { Line } from '../../classes/diagram/line';
import { Coords } from '../../classes/json-petri-net';
import {DrawingService} from "../drawing.service";


@Injectable({
    providedIn: 'root',
})
export class PnmlImportService {

    constructor(private _drawingService: DrawingService) {
    }

    import(content: string): Diagram | undefined {

        // convert pnml string to DOM object
        let rawData = new DOMParser().parseFromString(content, 'text/xml');
        // get all places as an Element instance from DOM object
        let places = this.importPlaces(rawData);
        // get all transitions as an Element instance from DOM object
        let transitions = this.importTransitions(rawData);

        // get all arcs as an Element instance from DOM object
        let arcs = this.importArcs(rawData, [...places, ...transitions]);

        return new Diagram([...places], [...transitions], [...arcs]);

    }

    importPlaces(rawData: Document): Array<Place> {

        const places:NodeListOf<globalThis.Element> = rawData.querySelectorAll('place');
        const result:Array<Place> = []
        places.forEach((place) => {

            const placePosition = this.getPlacePosition(place);
            const placeTokens = place.querySelector('initialMarking')?.querySelector('text')?.textContent ?? '0'
            const placeLabel = place.querySelector('name')?.querySelector('text')?.textContent ?? ''
            const placeId = place.getAttribute('id');

            if(!placeId) throw new Error('Place element misses id: ' + place);
            const placeElement = this.createPlace(placeId, placePosition.x, placePosition.y, placeTokens, placeLabel);
            placeElement.svgElement?.addEventListener(('click'), () => {
                this._drawingService.onCircleSelect(placeElement);
            });
            
            result.push(placeElement);
        });


        return result;
    }

    importTransitions(rawData: Document): Array<Transition> {
        const transitions = rawData.querySelectorAll('transition');
        const result:Array<Transition> = []
        transitions.forEach((transition) => {

            const transitionId = transition.getAttribute('id');
            const transitionLabel = transition.querySelector('name')?.querySelector('text')?.textContent ?? ''
            const transitionPosition = this.getTransitionPosition(transition);

            if(!transitionId) throw new Error('Transition element misses id: ' + transition);
            const transitionElement = this.createTransition(transitionId, transitionPosition.x, transitionPosition.y, transitionLabel);
            transitionElement.svgElement?.addEventListener(('click'), () => {
                this._drawingService.onRectSelect(transitionElement);
            });
            result.push(transitionElement);
        });

        return result;

    }

    importArcs(rawData: Document, elements: Element[]): Array<Line> {
        const arcs = rawData.querySelectorAll('arc');
        const lines:Array<Line> = []
        arcs.forEach((arc) => {

            const arcId = arc.getAttribute('id');
            const arcTokens = arc.querySelector('inscription')?.querySelector('text')?.textContent ?? '0'
            const sourceAndTargetObject = this.getSourceAndTargetElements(arc, elements);
            const positions = this.getArcPositions(arc);

            if(!arcId) throw new Error('Arc element misses id: ' + arc);
            const arcElement = this.createEdge(arcId, sourceAndTargetObject.sourceElement, sourceAndTargetObject.targetElement, positions, arcTokens);
            arcElement.svgElement?.addEventListener(('click'), () => {
                this._drawingService.onLineSelect(arcElement);
            });
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

    private getArcPositions(element: globalThis.Element):{x:number, y:number}[]{
        let result:{x:number, y:number}[] = [];
        const graphics = Array.from(element.children).filter(
            (child) => child.tagName == 'graphics'
        );
        const positions = Array.from(graphics[0].children).filter(
            (child) => child.tagName == 'position'
        );
        for(let position of positions){
            const x = position.getAttribute('x');
            const y = position.getAttribute('y');
            if (!x || !y) throw new Error('Arc element misses id or positional attribute: ' + element );
            result.push({ x: parseFloat(x), y: parseFloat(y) });
        }

       return result
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


    private createPlace(id:string, x:number, y:number, amountToken:string, label:string): Place {
        const place = new Place(id, x, y);
        place.x = x;
        place.y = y;
        place.amountToken = parseInt(amountToken);
        place.label = label;
        place.svgElement = place.createSVG();
        return place;


    }

    private createTransition(id:string, x:number, y:number, label:string): Transition {
        const transition = new Transition(id, x, y);
        transition.x = x;
        transition.y = y;
        transition.label = label;
        transition.svgElement = transition.createSVG();
        return transition;


    }

    private createEdge(id:string, source:Element, target:Element, coords: Coords[], amountToken:string): Line{

        const line:Line = new Line(id, source, target);
        line.coords = coords;
        line.tokens = parseInt(amountToken);
        line.createSVG();
        return line;

    }


}
