import {Line} from './line';
import { Place } from './place';
import { Transition } from './transition';

export class Diagram {
    // private readonly _elements: Array<Element>;
    private readonly _places: Array<Place>;
    private readonly _transitions: Array<Transition>;
    private readonly _lines: Array<Line>;

    constructor(places: Array<Place>, transitions: Array<Transition>, lines?: Array<Line>) {
        this._places = places;
        this._transitions = transitions;
        this._lines = lines ?? [];
    }

    get places(): Array<Place> {
        return this._places;
    }

    get transitions(): Array<Transition> {
        return this._transitions;
    }

    get lines(): Array<Line> {
        return this._lines;
    }

    pushPlace(place: Place): void {
        console.log('pushPlace');
        this._places.push(place);
    }

    pushTransition(transition: Transition): void {
        console.log('pushTransition');
        this._transitions.push(transition);
    }

    // pushElement(element: Element): void {
    //     console.log('pushElement');
        
    //     this._elements.push(element);
    // }

    pushLine(line: Line): void {
        console.log('pushLine');
        this._lines.push(line);
    }

    clearElements(): void {
        this._places.splice(0, this._places.length);
        this._transitions.splice(0, this._transitions.length);
        this._lines.splice(0, this._lines.length);
    }
}
