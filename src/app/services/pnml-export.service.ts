import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Element } from '../classes/diagram/element';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PnmlExport implements ExportService{
    constructor(private _displayService: DisplayService) {}

    private getElements(): Array<Element> {
        const result: Array<Element> = [];

        const elements = this._displayService.diagram.elements;

        for (const element of elements) {
            result.push(element);
        }
        return result;
    }

    export(): void {
        const elements = this.getElements();
        let pnmlString =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
        for (const element of elements) {
            
            
            if (element.svgElement?.tagName === 'circle') {
                pnmlString += `<place id="${element.id}">\n<name>\n<text>name="${element.id}"</text>\n</name>\n<graphics>\n<position x="${element.x}" y="${element.y}"/>\n</graphics>\n<initialMarking>\n<text>0</text>\n</initialMarking>\n</place>`;
            } else if (element.svgElement?.tagName === 'rect') {
                pnmlString += `<transition id="${element.id}"><name><text>"${element.id}"</text></name><graphics><position x="${element.x}" y="${element.y}"/></graphics></transition>`;
            } else if (element.svgElement?.tagName === 'line') {
                if(element.source && element.target){
                    pnmlString += `\n<arc id="${element.id}" source="${element.source.id}" target="${element.target.id}">\n<graphics>\n<position x="${element.x}" y="${element.y}"/>\n<position x="${element.x2}" y="${element.y2}"/>\n<inscription><text>0</text></inscription></graphics>\n</arc>`;

                }
                else{
                    throw new Error("To create a .pnml file, source and target have to be defined");
                }
            }
        }
        pnmlString += '\n</page>\n</net>\n</pnml>';

        const blob = new Blob([pnmlString], { type: 'text/xml' });

        // Erstellen einer URL für den Blob, um sie als Link zu verwenden.
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Zuweisen der URL zum Link und Festlegen des Dateinamens für den Download.
        a.href = url;
        a.download = 'petriNetz.pnml';

        // Download starten
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
