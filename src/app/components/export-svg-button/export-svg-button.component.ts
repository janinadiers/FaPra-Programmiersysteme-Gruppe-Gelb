import {Component, Input} from '@angular/core';
import {DisplayService} from "../../services/display.service";
import {take} from "rxjs";
import {SvgService} from "../../services/svg.service";

@Component({
    selector: 'app-export-svg-button',
    templateUrl: './export-svg-button.component.html',
    styleUrls: ['./export-svg-button.component.css']
})
export class ExportSvgButtonComponent {

    @Input() title: string | undefined;

    constructor(private displayService: DisplayService,
                private svgService: SvgService) {
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

    async exportSvg(e: MouseEvent) {
        this.prevent(e);

        // Das Diagramm wird über den displayService abgerufen und als Observable behandelt.
        // Mit take(1) wird sichergestellt, dass nur das erste Element abgerufen wird, und mit toPromise() wird es zu einem Promise.
        const diagram = await this.displayService.diagram$.pipe(take(1)).toPromise();

        if (diagram && diagram.elements.length > 0) {
            // Elemente des Diagramms in ein SVG-Format exportieren.
            const svgWithElements = this.svgService.exportToSvg(diagram.elements);

            // Erstellen einer Blob-Datei mit dem SVG-Inhalt und dem entsprechenden Typ.
            const blob = new Blob([svgWithElements], {type: 'image/svg+xml'});

            // Erstellen einer URL für den Blob, um sie als Link zu verwenden.
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');

            // Zuweisen der URL zum Link und Festlegen des Dateinamens für den Download.
            a.href = url;
            a.download = 'petriNetz.svg';

            // Download starten
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
}
