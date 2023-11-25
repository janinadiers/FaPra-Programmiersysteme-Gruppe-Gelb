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

        diagram.lines.forEach(line => {
            result.push(line.createSVG());
        });

        diagram.places.forEach(place => {
            result.push(new Place(place.id, place.x, place.y).createSVG());
        });

        diagram.transitions.forEach(transition => {
            result.push(new Transition(transition.id, transition.x, transition.y).createSVG());
        });

        return result;
    }

    public createSvgCircleForElement(element: Element): SVGElement {
        // Umformung muss geschehen, da sonst Informationen verloren gehen
        const place = new Place(element.id, element.x, element.y);
        return place.createSVG();
    }

    public createSvgRectangleForElement(element: Element): SVGElement {
        // Umformung muss geschehen, da sonst Informationen verloren gehen
        const transition = new Transition(element.id, element.x, element.y);
        return transition.createSVG();
    }

    public createSvgLineForElement(line: Line): SVGElement {
        line.createSVG();
        return line.svgElement!;
    }
}
