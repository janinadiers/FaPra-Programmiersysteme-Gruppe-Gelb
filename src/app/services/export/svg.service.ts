import { Injectable, ViewChild } from '@angular/core';
import {Element} from '../../classes/diagram/element';
import {Place} from "../../classes/diagram/place";
import {Transition} from "../../classes/diagram/transition";
import {Line} from "../../classes/diagram/line";
import {DisplayService} from "../display.service";
import { Diagram } from 'src/app/classes/diagram/diagram';

@Injectable({
    providedIn: 'root'
})
export class SvgService {

    constructor(private _displayService: DisplayService) {}

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
        // Prüfen, dass das SVG nicht abgeschnitten wird, sondern die Größe sich u. U. nach den Element-Koordinaten richtet
        const {maxX, maxY} = this
            .calculateMaxCoordinates([...this.getPlaces(), ...this.getTransitions()]);

        const circleRadius = 25;

        // Breite und Höhe basierend auf den maximalen Koordinaten und den Elementabmessungen festlegen
        const width = Math.max(1200, maxX + circleRadius)
        const height = Math.max(600, maxY + circleRadius);
        
        let svgElement = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${Diagram.viewBox.x} ${Diagram.viewBox.y} ${Diagram.viewBox.width} ${Diagram.viewBox.height}">`;

        this.getLines().forEach((line) => {
            if (line) {
                svgElement += line.svgElement.outerHTML;
            }
        });

        this.getPlaces().forEach((place) => {
            if (place) {
                svgElement += place.svgElement?.outerHTML;
            }
        });

        this.getTransitions().forEach((transition) => {
            if (transition) {
                svgElement += transition.svgElement?.outerHTML;
            }
        });


        svgElement += `</svg>`;
        
        
        return svgElement;
    }

    private calculateMaxCoordinates(elements: Element[]): { maxX: number, maxY: number } {
        let maxX = 0;
        let maxY = 0;

        elements.forEach(element => {
            if (element) {
                // Überprüfen, ob das Element die maximalen x- und y-Koordinaten überschreitet
                if (element.x > maxX) {
                    maxX = element.x;
                }
                if (element.y > maxY) {
                    maxY = element.y;
                }
            }
        });

        return {maxX, maxY};
    }
}
