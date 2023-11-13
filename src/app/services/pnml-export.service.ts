import { ExportService } from '../classes/export-service';
import { DisplayService } from './display.service';
import { Injectable } from '@angular/core';
import {DownloadService} from "./helper/download-service";
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';

@Injectable({
    providedIn: 'root',
})
export class PnmlExport implements ExportService{
    constructor(private _displayService: DisplayService,
                private downloadService: DownloadService) {}


    export(): void {
        const elements = this._displayService.diagram.elements
        const lines = this._displayService.diagram.lines
        let pnmlString =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
        for (const element of elements) {
            
            if (element instanceof Place) {
                pnmlString += `<place id="${element.id}">\n<name>\n<text>name="${element.id}"</text>\n</name>\n<graphics>\n<position x="${element.x}" y="${element.y}"/>\n</graphics>\n<initialMarking>\n<text>0</text>\n</initialMarking>\n</place>`;
            } else if (element instanceof Transition) {
                pnmlString += `<transition id="${element.id}"><name><text>"${element.id}"</text></name><graphics><position x="${element.x}" y="${element.y}"/></graphics></transition>`;
            } 
        }

        for (const line of lines) {
            console.log(line);
            pnmlString += `\n<arc id="${line.id}" source="${line.source.id}" target="${line.target.id}">\n<graphics/>\n<inscription><text>1</text></inscription>\n</arc>`;

        }
        pnmlString += '\n</page>\n</net>\n</pnml>';

        this.downloadService.downloadFile(pnmlString, 'petriNetz.pnml', 'text/xml');
    }
}
