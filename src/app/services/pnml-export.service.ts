import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Injectable } from '@angular/core';
import {DownloadService} from "./helper/download-service";


@Injectable({
    providedIn: 'root',
})
export class PnmlExport implements ExportService{
    constructor(private _displayService: DisplayService,
                private downloadService: DownloadService) {}


    export(): void {
        const places = this._displayService.diagram.places;
        const transitions = this._displayService.diagram.transitions;
        const lines = this._displayService.diagram.lines
        let pnmlString =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
        for (const place of places) {
            pnmlString += `<place id="${place.id}">\n<name>\n<text>${place.label}</text>\n</name>\n<graphics>\n<position x="${place.x}" y="${place.y}"/>\n</graphics>\n<initialMarking>\n<text>${place.amountToken}</text>\n</initialMarking>\n</place>`;
            
        }

        for (const transition of transitions) {
            pnmlString += `<transition id="${transition.id}"><name><text>${transition.label}</text></name><graphics><position x="${transition.x}" y="${transition.y}"/></graphics></transition>`;

        }

        for (const line of lines) {
            let graphics = '<graphics>\n';
            if(line.coords){
                for (const coord of line.coords) {
                    graphics += `<position x="${coord.x}" y="${coord.y}"/>\n`;
                }

            }
            graphics += '</graphics>\n';
/// Vorübergehend auskommentiert            pnmlString += `\n<arc id="${line.id}" source="${line.source?.id}" target="${line.target?.id}">\n${graphics}\n<inscription><text>${line.tokens}</text></inscription>\n</arc>`;

        }
        pnmlString += '\n</page>\n</net>\n</pnml>';

        this.downloadService.downloadFile(pnmlString, 'petriNetz.pnml', 'text/xml');
    }
}
