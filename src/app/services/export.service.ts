import {Injectable} from '@angular/core';
import {Element} from "../classes/diagram/element";
import {DisplayService} from "./display.service";
import {Coords, JsonPetriNet} from "../classes/json-petri-net";
import {SvgService} from "./svg.service";
import {Place} from "../classes/diagram/place";
import {Transition} from "../classes/diagram/transition";
import {Line} from "../classes/diagram/line";

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor(private _displayService: DisplayService,
                private _svgService: SvgService) {
    }

    private getElements(): Array<Element> {
        return [...this._displayService.diagram!.places, ...this._displayService.diagram!.transitions];
    }

    private getPlaces(): Array<Place> {
        return this._displayService.diagram!.places;
    }

    private getTransitions(): Array<Transition> {
        return this._displayService.diagram!.transitions;
    }

    private getLines(): Array<Line> {
        return this._displayService.diagram!.lines;
    }

    exportAsPNML(): string {
        let pnmlString =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
        for (const place of this.getPlaces()) {
            pnmlString += `<place id="${place.id}">\n<name>\n<text>${place.label}</text>\n</name>\n<graphics>\n<position x="${place.x}" y="${place.y}"/>\n</graphics>\n<initialMarking>\n<text>${place.amountToken}</text>\n</initialMarking>\n</place>`;
        }

        for (const transition of this.getTransitions()) {
            pnmlString += `<transition id="${transition.id}"><name><text>${transition.label}</text></name><graphics><position x="${transition.x}" y="${transition.y}"/></graphics></transition>`;
        }

        for (const line of this.getLines()) {
            let graphics = '<graphics>\n';
            if (line.coords) {
                for (const coord of line.coords) {
                    graphics += `<position x="${coord.x}" y="${coord.y}"/>\n`;
                }
            }
            graphics += '</graphics>\n';
            pnmlString += `\n<arc id="${line.id}" source="${line.source.id}" target="${line.target.id}">\n${graphics}\n<inscription><text>${line.tokens}</text></inscription>\n</arc>`;
        }
        pnmlString += '\n</page>\n</net>\n</pnml>';
        return pnmlString;
    }

    exportAsJSON(): string {
        //usage of given Json interface for PetriNet
        const petriNet: JsonPetriNet = {
            places: [],
            transitions: [],
            arcs: {},
            actions: [],
            labels: {},
            marking: {},
            layout: {}
        };

        this.getPlaces().forEach(place => {
            petriNet.places.push(place.id);

            if (place.amountToken > 0)
                petriNet.marking![place.id] = place.amountToken;

            petriNet.layout![place.id] = {x: place.x, y: place.y}
        });

        this.getTransitions().forEach(transition => {
            petriNet.transitions.push(transition.id);

            petriNet.layout![transition.id] = {x: transition.x, y: transition.y}
        });

        this.getLines().forEach(line => {
            petriNet.arcs![`${line.source.id},${line.target.id}`] = line.tokens;
            //if line has coords, save coords within given layout as array
            if (line.coords) {
                const intermediates: Coords[] = [];
                line.coords.forEach(coord => {
                    intermediates.push({x: coord.x, y: coord.y});
                });
                petriNet.layout![`${line.source.id},${line.target.id}`] = intermediates;
            }
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
        const {maxX, maxY} = this
            .calculateMaxCoordinates([...this.getPlaces(), ...this.getTransitions()]);

        const circleRadius = 25;

        // Breite und Höhe basierend auf den maximalen Koordinaten und den Elementabmessungen festlegen
        const width = Math.max(1200, maxX + circleRadius)
        const height = Math.max(600, maxY + circleRadius);

        let svgElement = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

        this.getLines().forEach((line) => {
            if (line) {
                svgElement += this._svgService.createSvgLineForElement(line).outerHTML;
            }
        });

        this.getPlaces().forEach((place) => {
            if (place) {
                svgElement += this._svgService.createSvgCircleForElement(place).outerHTML;
            }
        });

        this.getTransitions().forEach((transition) => {
            if (transition) {
                svgElement += this._svgService.createSvgRectangleForElement(transition).outerHTML;
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
