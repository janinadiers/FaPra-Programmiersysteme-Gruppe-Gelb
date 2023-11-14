import {Element} from './element';
import {Line} from './line';

export class Diagram {
    private readonly _elements: Array<Element>;
    private readonly _lines: Array<Line>;

    constructor(elements: Array<Element>) {
        this._elements = elements;
        this._lines = [];
    }

    get elements(): Array<Element> {
        return this._elements;
    }

    get lines(): Array<Line> {
        return this._lines;
    }

    pushElement(element: Element): void {
        console.log('pushElement');
        
        this._elements.push(element);
    }

    pushLine(line: Line): void {
        this._lines.push(line);
    }

    clearElements(): void {
        this._elements.splice(0, this._elements.length);
    }
}
