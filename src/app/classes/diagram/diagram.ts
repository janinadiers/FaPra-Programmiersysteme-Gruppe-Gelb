import {Element} from './element';

export class Diagram {
    private readonly _elements: Array<Element>;

    constructor(elements: Array<Element>) {
        this._elements = elements;
    }

    get elements(): Array<Element> {
        return this._elements;
    }

    pushElement(element: Element): void {
       
        this._elements.push(element);
    }

    clearElements(): void {
        this._elements.splice(0, this._elements.length);
    }
}

