import {Injectable} from '@angular/core';
import {Diagram} from '../classes/diagram/diagram';
import {Element} from '../classes/diagram/element';
import {Place} from "../classes/diagram/place";
import {Transition} from "../classes/diagram/transition";
import {Line} from "../classes/diagram/line";

@Injectable({
    providedIn: 'root'
})
export class SvgService {

    public createSvgElements(diagram: Diagram): Array<SVGElement> {

        const result: Array<SVGElement> = [];
        diagram.elements.forEach(el => {
            const svgElement = this.createSvgCircleForElement(el);
            el.registerSvg(svgElement);
            result.push(svgElement);
        });
        return result;
    }

    private createSvgCircleForElement(element: Element): SVGElement {
        // Umformung muss geschehen, da sonst Informationen verloren gehen
        const place = new Place(element.id, element.x, element.y);
        return place.createSVG();
    }

    private createSvgRectangleForElement(element: Element): SVGElement {
        // Umformung muss geschehen, da sonst Informationen verloren gehen
        const transition = new Transition(element.id, element.x, element.y);
        return transition.createSVG();
    }

    private createSvgLineForElement(line: Line): SVGElement {
        line.createSVG();
        return line.svgElement!;
    }

    public exportToSvg(diagram: Diagram): string {
        const elements = diagram.elements;
        const lines = diagram.lines;

        // Prüfen, dass das SVG nicht abgeschnitten wird, sondern die Größe sich u. U. nach den Element-Koordinaten richtet
        const { maxX, maxY } = this.calculateMaxCoordinates(elements);

        const circleRadius = 25;

        // Breite und Höhe basierend auf den maximalen Koordinaten und den Elementabmessungen festlegen
        const width = Math.max(1200, maxX + circleRadius)
        const height = Math.max(600, maxY + circleRadius);

        let svgElement = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

        lines.forEach((line) => {
            if(line) {
                svgElement += this.createSvgLineForElement(line).outerHTML;
            }
        });

        elements.forEach(element => {
            if (element) {
                let svgElem;
                if(element.svgElement instanceof SVGCircleElement) {
                    svgElem = this.createSvgCircleForElement(element)
                    svgElement += svgElem.outerHTML;
                } else if (element.svgElement instanceof SVGRectElement) {
                    svgElem = this.createSvgRectangleForElement(element)
                    svgElement += svgElem.outerHTML;
                }
                element.registerSvg(svgElem!);
            }
        });

        svgElement += `</svg>`;

        return svgElement;
    }

    private calculateMaxCoordinates(elements: Element[]): { maxX: number, maxY: number } {
        let maxX = 0;
        let maxY = 0;

        elements.forEach(element => {
            if(element) {
                // Überprüfen, ob das Element die maximalen x- und y-Koordinaten überschreitet
                if(element.x > maxX) {
                    maxX = element.x;
                }
                if(element.y > maxY) {
                    maxY = element.y;
                }
            }
        });

        return { maxX, maxY };
    }
}
