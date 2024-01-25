import {Injectable} from '@angular/core';
import {DisplayService} from "./display.service";
import {Transition} from "../classes/diagram/transition";
import {Place} from "../classes/diagram/place";
import {transition} from "@angular/animations";

@Injectable({
    providedIn: 'root'
})
export class LabelValidatorService {

    private readonly EDIT_LABEL_TEXT = 'Edit the label designation:'
    private readonly INVALID_LABEL: string = 'The label designation is invalid. A label with this name may already exist.';
    private readonly TEXT_ELEMENT_NOT_FOUND: string = 'Text element not found.';

    private labelEventListeners: Map<Transition, EventListener> = new Map();

    constructor(private displayService: DisplayService) {
    }

    public createLabelEventListener(element: Transition) {
        const textElementSelector = element.svgElement?.querySelector('text:last-child');

        if (textElementSelector) {
            const handler = (event: Event) => {
                // Prüfen, ob der Listener deaktiviert ist
                if (this.labelEventListeners.has(element)) {
                    const editedLabel = prompt(this.EDIT_LABEL_TEXT, element.label);

                    if (editedLabel !== null && editedLabel !== undefined && this.isLabelValid(editedLabel, element)) {
                        element.label = editedLabel;
                        textElementSelector.textContent = editedLabel;
                    } else if (editedLabel !== null && editedLabel !== undefined) {
                        alert(this.INVALID_LABEL);
                    }
                }
            };

            // Binden des Event-Handlers an den Handler und Speichern in der Map
            const boundHandler = handler.bind(this);
            this.labelEventListeners.set(element, boundHandler);

            // Event-Listener registrieren
            textElementSelector.addEventListener('click', boundHandler);
        } else {
            console.warn(this.TEXT_ELEMENT_NOT_FOUND);
        }
    }

    public disableLabelEventListeners(transitions: Transition[]): void {
        transitions.forEach((transition) => {
            if (this.labelEventListeners.has(transition)) {
                const listener = this.labelEventListeners.get(transition);
                const textElementSelector = transition.svgElement?.querySelector('text:last-child');
                if (listener && textElementSelector) {
                    textElementSelector.removeEventListener('click', listener);
                }
            }
        });
    }

    public enableLabelEventListeners(transitions: Transition[]): void {
        transitions.forEach((transition) => {
            if (this.labelEventListeners.has(transition)) {
                const listener = this.labelEventListeners.get(transition);
                const textElementSelector = transition.svgElement?.querySelector('text:last-child');
                if (listener && textElementSelector) {
                    textElementSelector.addEventListener('click', listener);
                }
            }
        });
    }

    private isLabelValid(newLabel: string, originElement: Transition): boolean {
        // Trimmen
        const trimmedLabel = newLabel?.trim();

        if(!trimmedLabel || trimmedLabel.length === 0) {
            return false;
        }

        const transitions = this.displayService.diagram.transitions;

        // Überprüfen Sie, ob ein anderes Element bereits denselben Label-Namen hat
        const hasDuplicateLabel = transitions.some(element => element.label === newLabel && element !== originElement);

        return !hasDuplicateLabel;
    }
}
