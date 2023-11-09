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
        const elements = this._displayService.diagram.elements
        if(elements.length === 0) return;
        let pnmlString =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
        for (const element of elements) {
            
            if (element.svgElement?.tagName === 'circle') {
                pnmlString += `<place id="${element.id}">\n<name>\n<text>name="${element.id}"</text>\n</name>\n<graphics>\n<position x="${element.x}" y="${element.y}"/>\n</graphics>\n<initialMarking>\n<text>0</text>\n</initialMarking>\n</place>`;
            } else if (element.svgElement?.tagName === 'rect') {
                pnmlString += `<transition id="${element.id}"><name><text>"${element.id}"</text></name><graphics><position x="${element.x}" y="${element.y}"/></graphics></transition>`;
            } else if (element.svgElement?.tagName === 'line') {
                
                if(element.sourceID && element.targetID){
                    pnmlString += `\n<arc id="${element.id}" source="${element.sourceID}" target="${element.targetID}">\n<graphics/>\n<inscription><text>1</text></inscription>\n</arc>`;

                }
                else{
                    throw new Error("To create a .pnml file, source and target have to be defined");
                }
            }
        }
        pnmlString += '\n</page>\n</net>\n</pnml>';

        this.downloadService.downloadFile(pnmlString, 'petriNetz.pnml', 'text/xml');
    }
}
