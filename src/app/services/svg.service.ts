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
            
            if(el.svgElement instanceof SVGCircleElement) {
               result.push(this.createSvgCircleForElement(el));
            } else if (el.svgElement instanceof SVGRectElement) {
                result.push(this.createSvgRectangleForElement(el));
            } else if(el.svgElement instanceof SVGLineElement) {
                result.push(this.createSvgLineForElement(el));
            }
           
            
        });
        
        return result;
    }

    public createSvgCircleForElement(element: Element): SVGElement {
        const svg = this.createSvgElement('circle');

        svg.setAttribute('cx', `${element.x}`);
        svg.setAttribute('cy', `${element.y}`);
        svg.setAttribute('r', '25');
        svg.setAttribute('fill', 'white');
        svg.setAttribute('stroke', 'black');
        svg.setAttribute('stroke-width', '1');

        element.registerSvg(svg);

        return svg;
    }

    public createSvgRectangleForElement(element: Element): SVGElement {
        const svg = this.createSvgElement('rect');

        svg.setAttribute('x', `${element.x}`);
        svg.setAttribute('y', `${element.y}`);
        svg.setAttribute('width', `25`);
        svg.setAttribute('height', `50`);
        svg.setAttribute('fill', 'black');

        element.registerSvg(svg);

        return svg;
    }

    public createSvgLineForElement(element: Element): SVGElement {
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
                svgElement += this.createSvgCircleForElement(element).outerHTML;

                // TODO: Je nach Elementtyp unterscheiden (Rechteck, Kreis, etc.)
                // oder für ein Rechteck:
                // svgString += `<rect id="${element.id}" x="${element.x}" y="${element.y}" width="100" height="100" fill="blue" />`;
            }
        });

        svgElement += `</svg>`;

        return svgElement;
    }
}
