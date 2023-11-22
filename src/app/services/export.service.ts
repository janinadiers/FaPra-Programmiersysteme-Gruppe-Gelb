import {Injectable} from '@angular/core';
import {Element} from "../classes/diagram/element";
import {DisplayService} from "./display.service";
import {JsonPetriNet} from "../classes/json-petri-net";
import {SvgService} from "./svg.service";

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor(private _displayService: DisplayService,
                private _svgService: SvgService) {
    }

    private getElements(): Array<Element> {
        return this._displayService.diagram.elements;
    }

    exportAsPNML(): string {
        let pnmlString =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
        for (const element of this.getElements()) {
            if (element.svgElement?.tagName === 'circle') {
                pnmlString += `<place id="${element.id}">\n<name>\n<text>name="${element.id}"</text>\n</name>\n<graphics>\n<position x="${element.x}" y="${element.y}"/>\n</graphics>\n<initialMarking>\n<text>0</text>\n</initialMarking>\n</place>`;
            } else if (element.svgElement?.tagName === 'rect') {

                pnmlString += `<transition id="${element.id}"><name><text>"${element.id}"</text></name><graphics><position x="${element.x}" y="${element.y}"/></graphics></transition>`;
            } else if (element.svgElement?.tagName === 'line') {
                pnmlString += `<arc id="${element.id}" source="${element.id}" target="${element.id}"><graphics><position x="${element.x}" y="${element.y}"/></graphics></arc>`;
            }
        }
        pnmlString += '</page>\n</net>\n</pnml>';
        return pnmlString;
    }

    exportAsJSON(): string {
        const petriNet: JsonPetriNet = {
            places: [],
            transitions: [],
            arcs: {},
            actions: [],
            labels: {},
            marking: {},
            layout: {}
        };

        const elements = this.getElements();

        elements.forEach(element => {
            petriNet.places.push(element.id);
            petriNet.layout![element.id] = {x: element.x, y: element.y}
        });

        return JSON.stringify(petriNet);
    }

    exportAsPNG(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const svgString = this.exportAsSVG();

            const image = new Image();
            const svg = new Blob([svgString], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svg);

            // Zuweisen der URL und Browserfehler abfangen
            const domUrl = window.URL || window.webkitURL || window;
            if (!domUrl) {
                reject("(browser doesn't support this)");
            }

            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;

                const context = canvas.getContext('2d');
                if (context) {
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const blobUrl = URL.createObjectURL(blob);
                            resolve(blobUrl);
                        } else {
                            reject('Error creating blob.');
                        }
                    });
                }
            };

            image.onerror = () => {
                reject('Error loading image.');
            };

            image.src = url;
        });
    }

    exportAsSVG(): string {
        // Prüfen, dass das SVG nicht abgeschnitten wird, sondern die Größe sich u. U. nach den Element-Koordinaten richtet
        let maxX = 0;
        let maxY = 0;

        const elements = this.getElements();

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

        const circleRadius = 25;

        // Breite und Höhe basierend auf den maximalen Koordinaten und den Elementabmessungen festlegen
        const width = Math.max(1200, maxX + circleRadius)
        const height = Math.max(600, maxY + circleRadius);

        let svgElement = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

        elements.forEach(element => {
            if (element) {
                svgElement += this._svgService.createSvgCircleForElement(element).outerHTML;
            }
        });

        svgElement += `</svg>`;

        return svgElement;
    }
}
