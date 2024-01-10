import { Injectable } from '@angular/core';
import { Diagram } from '../classes/diagram/diagram';
import { Element } from '../classes/diagram/element';
import { Line } from '../classes/diagram/line';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import {Subscription} from "rxjs";
import {DisplayService} from "./display.service";
import {DrawingService} from "./drawing.service";

@Injectable({
    providedIn: 'root'
})
export class ParserService {

    private _sub: Subscription;
    private _diagram: Diagram | undefined;

    constructor(
        private _displayService: DisplayService,
        private _drawingService: DrawingService) {
            this._sub  = this._displayService.diagram$.subscribe(diagram => {
                this._diagram = diagram;
            });
    }

    parse(text: string): Diagram | undefined {
        try {
            const rawData = JSON.parse(text) as JsonPetriNet;

            const places = this.createPlaces(rawData['places'], rawData['layout'], rawData['marking'] as JsonPetriNet['marking']);
            const transitions = this.createTransitions(rawData['transitions'], rawData['layout'], rawData['labels'] as JsonPetriNet['labels']);
            const arcs = rawData['arcs'] as JsonPetriNet['arcs'];

            if(places && transitions && arcs){
                const lines = this.createLines(rawData['layout'], places, transitions, arcs)

                return new Diagram(places, transitions, lines);
            }
            return undefined;



        } catch (e) {
            console.error('Error while parsing JSON', e, text);
            return undefined;
        }
    }

    private createPlaces(placeIds: Array<string> | undefined, layout: JsonPetriNet['layout'], marking: JsonPetriNet['marking'] | undefined): Place[] | undefined {
        if (layout === undefined || placeIds === undefined || marking === undefined) {
            return;
        }
        let places = []
        for (const id of placeIds) {
            const pos = layout[id] as Coords | undefined;
            if (pos !== undefined) {
                const place = new Place(id, pos.x, pos.y, marking[id])
                place.createSVG()
                place.svgElement?.addEventListener(('click'), () => {
                    this._drawingService.onCircleSelect(place);
                });
                places.push(place)

            }
        }
        return places;
    }

    private createTransitions(transitionIds: Array<string> | undefined, layout: JsonPetriNet['layout'], labels: JsonPetriNet['labels'] | undefined): Transition[] | undefined {
        if (layout === undefined || transitionIds === undefined || labels === undefined) {
            return;
        }
        let transitions = []
        for (const id of transitionIds) {
            const pos = layout[id] as Coords | undefined;
            if (pos !== undefined) {
                const transition = new Transition(id, pos.x, pos.y, labels[id])
                transition.createSVG();
                transition.svgElement?.addEventListener(('click'), () => {
                    this._drawingService.onRectSelect(transition);
                })
                transitions.push(transition)
            }
        }
        return transitions;
    }

    private createLines(layout: JsonPetriNet['layout'], places: Array<Place>, transitions: Array<Transition>, arcs: JsonPetriNet['arcs']): Array<Line> {
        const lines: Array<Line> = [];

        if (arcs) {

            for (const arc in arcs) {
                //sourceTarget[0] -> SourceID || sourceTarget[1] -> TargetID
                const sourceTarget = arc.split(',');
                if (arc.startsWith('p')) { //Place
                    lines.push(new Line(arc, places.find(pid => pid.id === sourceTarget[0]) as Element, transitions.find(tid => tid.id === sourceTarget[1]) as Element, undefined, arcs[arc]));
                } else { //Transition
                    lines.push(new Line(arc, transitions.find(tid => tid.id === sourceTarget[0]) as Element, places.find(pid => pid.id === sourceTarget[1]) as Element, undefined, arcs[arc]));
                }
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
            lines.forEach(line => {
                line.createSVG();            
                this.setChildrenAndParents(line);
                line.svgElement?.addEventListener(('click'), () => {
                        this._drawingService.onLineSelect(line);
                    }
                );
            });
        }
        return lines;
    }

    private setChildrenAndParents(line:Line):void{
        const source = line.source;
        const target = line.target;

        if(source instanceof Place && target instanceof Transition){
            source.children.push(target);
            target.parents.push(source);
        }
        if(source instanceof Transition && target instanceof Place){
            source.children.push(target);
            target.parents.push(source);
        }
    }
}
