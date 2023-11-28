import {Component, Input} from '@angular/core';
import {DisplayService} from "../../services/display.service";
import {take} from "rxjs";
import {SvgService} from "../../services/svg.service";
import {DownloadService} from "../../services/helper/download-service";

@Component({
    selector: 'app-export-svg-button',
    templateUrl: './export-svg-button.component.html',
    styleUrls: ['./export-svg-button.component.css']
})
export class ExportSvgButtonComponent {

    @Input() title: string | undefined;

    constructor(private displayService: DisplayService,
                private svgService: SvgService,
                private downloadService: DownloadService) {
    }

    prevent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    hoverStart(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.add('mouse-hover');
    }

    hoverEnd(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.remove('mouse-hover');
    }

    async exportSvg() {

        // Das Diagramm wird über den displayService abgerufen und als Observable behandelt.
        // Mit take(1) wird sichergestellt, dass nur das erste Element abgerufen wird, und mit toPromise() wird es zu einem Promise.
        const diagram = await this.displayService.diagram$.pipe(take(1)).toPromise();

        const elements = [...diagram!.places, ...diagram!.transitions]

        if (diagram && elements.length > 0) {
            
            // Elemente des Diagramms in ein SVG-Format exportieren.
            const svgWithElements = this.svgService.exportToSvg(diagram);

            // Download der SVG-Datei
            this.downloadService.downloadFile(svgWithElements,'petriNetz.svg', 'image/svg+xml');
        }
    }
}
