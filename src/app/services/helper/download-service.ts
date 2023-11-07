import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    constructor() {
    }

    public downloadFile(content: string, downloadFileName: string, type: string): void {
        const a = document.createElement('a');
        if (type === 'image/png') {
            a.href = content;
        } else {
            const blob = new Blob([content], {type: type});
            a.href = window.URL.createObjectURL(blob);
        }

        a.download = downloadFileName;
        a.click();
        window.URL.revokeObjectURL(a.href);
    }
}
