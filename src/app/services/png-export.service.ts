import {Injectable} from '@angular/core';
import {DownloadService} from "./helper/download-service";
import {DisplayService} from "./display.service";
import {SvgService} from "./svg.service";

@Injectable({
    providedIn: 'root'
})

export class PngExportService {
    constructor(private downloadService: DownloadService,
                private displayService: DisplayService,
                private svgService: SvgService) {
    }

    createPngFile() {
        const diagram = this.displayService.diagram;
        const svgString = this.svgService.exportToSvg(diagram.elements);

        const image = new Image();
        const svg = new Blob([svgString], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(svg);

        // Zuweisen der URL und Browserfehler abfangen
        const domUrl = window.URL || window.webkitURL || window;
        if (!domUrl) {
            throw new Error("(browser doesnt support this)")
        }

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        this.downloadService.downloadPng(URL.createObjectURL(blob), 'petriNetz.png');
                    }
                });
            }
        };

        image.src = url;
    }
}
