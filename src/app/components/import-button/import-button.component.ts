import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-import-button',
  templateUrl: './import-button.component.html',
  styleUrls: ['./import-button.component.css']
})
export class ImportButtonComponent {
    public static readonly META_DATA_CODE = 'drag-file-location';

    @Input() title: string | undefined;

    constructor() {
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

    processMouseClick(e: MouseEvent) {
        console.log(`Template button "${this.title}" clicked`, e);
    }
}
