import {Injectable} from '@angular/core';
import {DisplayService} from "./display.service";
import {Transition} from "../classes/diagram/transition";
import {Place} from "../classes/diagram/place";

@Injectable({
    providedIn: 'root'
})
export class LabelValidatorService {

    private readonly EDIT_LABEL_TEXT = 'Edit the label designation:'
    private readonly INVALID_LABEL: string = 'The label designation is invalid. A label with this name may already exist.';
    private readonly TEXT_ELEMENT_NOT_FOUND: string = 'Text element not found.';

    constructor(private displayService: DisplayService) {
    }

    public createLabelEventListener(element: Transition | Place) {
        const textElementSelector = element.svgElement?.querySelector('text:last-child');

        if (textElementSelector) {
            textElementSelector.addEventListener('click', () => {
                const editedLabel = prompt(this.EDIT_LABEL_TEXT, element.label);

                if (editedLabel !== null && editedLabel !== undefined && this.isLabelValid(editedLabel, element)) {
                    element.label = editedLabel;
                    textElementSelector.textContent = editedLabel;
                } else if (editedLabel !== null && editedLabel !== undefined) {
                    alert(this.INVALID_LABEL);
                }
            });
        } else {
            console.warn(this.TEXT_ELEMENT_NOT_FOUND);
        }
    }

    private isLabelValid(newLabel: string, originElement: Transition | Place): boolean {
        const trimmedLabel = newLabel?.trim();

        if(!trimmedLabel || trimmedLabel.length === 0) {
            return false;
        }

        const diagram = this.displayService.diagram;
        const elements = [...diagram.places, ...diagram.transitions];

        // Überprüfen Sie, ob ein anderes Element bereits denselben Label-Namen hat
        const hasDuplicateLabel = elements.some(element => element.label === newLabel && element !== originElement);

        return !hasDuplicateLabel;
    }
}
