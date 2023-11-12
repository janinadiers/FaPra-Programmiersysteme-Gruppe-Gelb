import {Injectable} from '@angular/core';
import {Diagram} from '../classes/diagram/diagram';
import {Element} from '../classes/diagram/element';

@Injectable({
    providedIn: 'root'
})
export class SvgService {

    public createSvgElements(diagram: Diagram): Array<SVGElement> {
       
        const result: Array<SVGElement> = [];
        diagram.elements.forEach(el => {
            
            result.push(this.createSvgCircleForElement(el))
        });
        return result;
    }

    private createSvgCircleForElement(element: Element): SVGElement {
        const svg = this.createSvgElement('circle');

        svg.setAttribute('cx', `${element.x}`);
        svg.setAttribute('cy', `${element.y}`);
        svg.setAttribute('r', '25');
        svg.setAttribute('fill', 'white'); // Farbe
        svg.setAttribute('stroke', 'black'); // Border Farbe
        svg.setAttribute('stroke-width', '2');

        element.registerSvg(svg);

        return svg;
    }

    private createSvgRectangleForElement(element: Element): SVGElement {
        const svg = this.createSvgElement('rect');

        svg.setAttribute('x', `${element.x}`);
        svg.setAttribute('y', `${element.y}`);
        svg.setAttribute('width', `20`);
        svg.setAttribute('height', `40`);
        svg.setAttribute('fill', 'black');
        svg.setAttribute('stroke', 'black');
        svg.setAttribute('stroke-width', '2');

        element.registerSvg(svg);

        return svg;
    }

    private createSvgLineForElement(element: Element): SVGElement {
        const svg = this.createSvgElement('line');

        svg.setAttribute('x1', `${element.x}`);
        svg.setAttribute('y1', `${element.y}`);
        svg.setAttribute('x2', `${element.x2}`);
        svg.setAttribute('y2', `${element.y2}`);
        svg.setAttribute('stroke', 'black');
        svg.setAttribute('stroke-width', '1');

        element.registerSvg(svg);

        return svg;
    }

    private createSvgElement(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    public exportToSvg(elements: Array<Element>): string {

        // Prüfen, dass das SVG nicht abgeschnitten wird, sondern die Größe sich u. U. nach den Element-Koordinaten richtet
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

        const circleRadius = 25;

        // Breite und Höhe basierend auf den maximalen Koordinaten und den Elementabmessungen festlegen
        const width = Math.max(1200, maxX + circleRadius)
        const height = Math.max(600, maxY + circleRadius);

        let svgElement = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

        elements.forEach(element => {
            if (element) {
                if(element.svgElement instanceof SVGCircleElement) {
                    svgElement += this.createSvgCircleForElement(element).outerHTML;
                } else if (element.svgElement instanceof SVGRectElement) {
                    svgElement += this.createSvgRectangleForElement(element).outerHTML;
                } else if(element.svgElement instanceof SVGLineElement) {
                    svgElement += this.createSvgLineForElement(element).outerHTML;
                }
            }
        });

        svgElement += `</svg>`;

        return svgElement;
    }
}
