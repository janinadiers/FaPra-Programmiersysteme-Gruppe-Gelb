import {Injectable} from '@angular/core';
import {Element} from "../classes/diagram/element";

@Injectable({
    providedIn: 'root'
})
export class SvgExportService {

    constructor() {
    }

    exportToSvg(elements: Array<Element>): string {
        let svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">`;

        elements.forEach(element => {
            const svgElementAttributes = element.svgElement;
            if (svgElementAttributes) {
                const circleRadius = 25;
                svgString += `<circle id="${svgElementAttributes.id}" cx="${svgElementAttributes.x}" cy="${svgElementAttributes.y}" r="${circleRadius}" fill="black" />`;

                // TODO: Je nach Elementtyp unterscheiden (Rechteck, Kreis, etc.)
                // oder für ein Rechteck:
                // svgString += `<rect id="${svgElementAttributes.id}" x="${svgElementAttributes.x}" y="${svgElementAttributes.y}" width="100" height="100" fill="blue" />`;
            }
        });

        svgString += `</svg>`;

        return svgString;
    }
}
