import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    constructor() {
    }

    public downloadFile(content: string, downloadFileName: string, type: string): void {
        if (type === 'image/png') {
            const a = document.createElement('a');
            a.href = content;
            a.download = downloadFileName;
            a.click();
        } else {
            const blob = new Blob([content], { type: type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = downloadFileName;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
}
