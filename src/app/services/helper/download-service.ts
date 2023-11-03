import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    constructor() {
    }

    public downloadSvgOrPnml(content: string, type: string, downloadFileName: string): void {
        // Erstellen einer Blob-Datei mit dem SVG-Inhalt und dem entsprechenden Typ.
        const blob = new Blob([content], {type: type});

        // Erstellen einer URL für den Blob, um sie als Link zu verwenden.
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Zuweisen der URL zum Link und Festlegen des Dateinamens für den Download.
        a.href = url;
        a.download = downloadFileName;

        // Download starten
        a.click();
        window.URL.revokeObjectURL(url);
    }

    public downloadPng(content: string, downloadFileName: string): void {
        const a = document.createElement('a');
        a.href = content;
        a.download = downloadFileName;
        a.click();
    }
}
