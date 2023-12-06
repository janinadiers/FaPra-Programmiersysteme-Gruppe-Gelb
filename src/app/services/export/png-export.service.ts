import {Injectable} from '@angular/core';
import {SvgService} from "../svg.service";

@Injectable({
    providedIn: 'root'
})
export class PngExportService {

    constructor(private _svgService: SvgService) {
    }

    export(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const svgString = this._svgService.export();

            const image = new Image();
            const svg = new Blob([svgString], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svg);

            // Zuweisen der URL und Browserfehler abfangen
            const domUrl = window.URL || window.webkitURL || window;
            if (!domUrl) {
                reject("(browser doesn't support this)");
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
                            const blobUrl = URL.createObjectURL(blob);
                            resolve(blobUrl);
                        } else {
                            reject('Error creating blob.');
                        }
                    });
                }
            };

            image.onerror = () => {
                reject('Error loading image.');
            };

            image.src = url;
        });
    }
}
