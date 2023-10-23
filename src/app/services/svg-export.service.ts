import {Injectable} from '@angular/core';
import {Element} from "../classes/diagram/element";

@Injectable({
    providedIn: 'root'
})
export class SvgExportService {

    constructor() {
    }

    exportToSvg(elements: Array<Element>): string {
        let svgElement = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">`;

        elements.forEach(element => {
            if (element) {
                const circleRadius = 25;
                svgElement += `<circle id="${element.id}" cx="${element.x}" cy="${element.y}" r="${circleRadius}" fill="black" />`;

                // TODO: Je nach Elementtyp unterscheiden (Rechteck, Kreis, etc.)
                // oder für ein Rechteck:
                // svgString += `<rect id="${element.id}" x="${element.x}" y="${element.y}" width="100" height="100" fill="blue" />`;
            }
        });

        svgElement += `</svg>`;

        return svgElement;
    }
}
