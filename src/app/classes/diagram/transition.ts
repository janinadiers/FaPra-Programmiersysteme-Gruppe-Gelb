import { Element } from 'src/app/classes/diagram/element';
import { Place } from './place';
import { Coords } from '../json-petri-net';

export class Transition extends Element {

    private _isActive: boolean;
    private _width: number;
    private _height: number;
    private _children: Array<Place>;
    private _parents: Array<Place>;
    private _label: string;
    private _contextMenuOpen:boolean = false;

    constructor(id: string, x: number, y: number, label?: string) {
        super(id, x, y);
        this._isActive = false; //Standardmäßig nicht aktiviert
        this._width = 20;
        this._height = 40;
        this._children = [];
        this._parents = [];
        this._label = label ?? "";
    }

    get isActive(): boolean {
        return this._isActive;
    }

    set isActive(value: boolean) {
        this._isActive = value;
    }

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
    }

    get children(): Array<Place> {
        return this._children;
    }

    set children(object: Place) {
        this._children.push(object);
    }

    get parents(): Array<Place> {
        return this._parents;
    }

    set parents(place: Place) {
        this._parents.push(place);
    }

    // Methode, um zu überprüfen, ob ein Klick innerhalb der Begrenzungen der Transition liegt
    isClicked(x: number, y: number): boolean {
        return (
            x >= this.x - this.width / 2 &&
            x <= this.x + this.width / 2 &&
            y >= this.y - this.height / 2 &&
            y <= this.y + this.height / 2
        );
    }

    updateGroup(newPosition: Coords) {
        super.x = newPosition.x;
        super.y = newPosition.y;

        super.svgElement?.setAttribute('transform', `translate(${newPosition.x - this.width / 2}, ${newPosition.y - this.height / 2})`);
    }

    isSilent(): boolean {
        return !this._label || this.label.trim().length === 0;
    }

    changeLabelAndSilentStatus(label: string): void {
        if(this.isSilent()) {
            this.label = label;
            const labelText = super.createSVG('text');
            labelText.setAttribute('text-anchor', 'middle');
            labelText.setAttribute('alignment-baseline', 'central');
            labelText.setAttribute('dy', `20`);
            labelText.setAttribute('dx', `${this.width / 2}`);
            labelText.textContent = label;
            this.svgElement?.appendChild(labelText);
            this.svgElement?.children[0].setAttribute('fill', 'white');
        } else {
            const labelText = this.svgElement!.querySelector('text:last-child');
            labelText!.textContent = label;
            this.label = label;

            // Überprüfe die Länge des Labels und passe die Farbe an
            if (label.trim().length === 0) {
                this.label = "";
                this.svgElement?.children[0].setAttribute('fill', 'black');
            }
        }
    }

    private createContextmenu(x:number, y:number): HTMLElement {
        const div = document.createElement('div');
        div.innerHTML =`
            <div style="position: fixed; z-index: 100; background-color: white; padding: 5px; cursor:pointer; left: ${x + 20}px; top: ${y + 5 }px; box-shadow: 1px 1px 22px -6px black" onMouseOver="this.style.background='gray'" onMouseOut="this.style.background='white'">
                <div class="context-menu-item" id="delete">Change label</div>
            </div>
            `
        document.body.appendChild(div);
        return div;
    }

    deactivateContextMenu() {
        this.svgElement!.removeEventListener('contextmenu', this._contextMenuHandler);
    }

    activateContextMenu() {
        this.svgElement!.addEventListener('contextmenu', this._contextMenuHandler);
    }

    private _contextMenuHandler = (event: MouseEvent) => {
        if (this._contextMenuOpen) {
            return;
        }

        this._contextMenuOpen = true;
        event.preventDefault();
        event.stopPropagation();

        const div = this.createContextmenu(event.clientX, event.clientY);

        window.addEventListener('click', (event) => {
            event.stopPropagation();
            div.remove();
            this._contextMenuOpen = false;
        });

        div.addEventListener('click', () => {
            div.remove();
            const newLabel = prompt("Change the label: ", this.label);
            if (newLabel !== null) {
                this.changeLabelAndSilentStatus(newLabel);
            }
            this._contextMenuOpen = false;
        });
    };

    override createSVG(){
        if (this.svgElement) {
            return this.svgElement;
        }

        const group = super.createSVG('g');
        group.setAttribute('id', this.id);
        group.setAttribute('transform', `translate(${this.x - this.width / 2}, ${this.y - this.height / 2})`);
        //Transition
        const rect = super.createSVG('rect');
        rect.setAttribute('id', this.id.toString());
        rect.setAttribute('width', this.width.toString());
        rect.setAttribute('height', this.height.toString());
        if(this.isSilent()) {
            rect.setAttribute('fill', 'black');
        } else {
            rect.setAttribute('fill', 'white');
        }
        rect.setAttribute('stroke', 'black');
        rect.setAttribute('stroke-width', '2');
        group.appendChild(rect);

        //ID-Text unten drunter
        const idText = super.createSVG('text');
        idText.setAttribute('text-anchor', 'middle');
        idText.setAttribute('alignment-baseline', 'central');
        idText.setAttribute('dy', `${this.height + 10}`);
        idText.setAttribute('dx', `${this.width / 2}`);
        idText.textContent = this.id;
        group.appendChild(idText);

        // Label, wenn vorhanden in die Mitte
        if(!this.isSilent()) {
            const labelText = super.createSVG('text');
            labelText.setAttribute('text-anchor', 'middle');
            labelText.setAttribute('alignment-baseline', 'central');
            labelText.setAttribute('dy', `20`);
            labelText.setAttribute('dx', `${this.width / 2}`);
            labelText.setAttribute('id', `${this.label}`);
            labelText.textContent = this.label;
            group.appendChild(labelText);
        }

        group.addEventListener('contextmenu', this._contextMenuHandler);

        super.registerSvg(group);
        return group;
    }
}
