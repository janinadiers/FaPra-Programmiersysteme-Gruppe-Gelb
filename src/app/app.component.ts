import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ParserService } from './services/parser.service';
import { PnmlImportService } from './services/pnml-import.service';
import { DisplayService } from './services/display.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    
    public textareaFc: FormControl;

    constructor(
        private _parserService: ParserService,
        private _displayService: DisplayService,
        private _pnmlImportService: PnmlImportService
    ) {
        this.textareaFc = new FormControl();
        this.textareaFc.disable();
    }

    public processSourceChange(newSource: {fileContent: string, fileExtension: string}) {
        this.textareaFc.setValue(newSource);
        let result = undefined;
        
        if (newSource.fileExtension === 'pnml') {
            result = this._pnmlImportService.import(newSource.fileContent);
            console.log('result: ', result);
            
        } else if (newSource.fileExtension === 'json') {
            result = this._parserService.parse(newSource.fileContent);
        } else {
            alert("Please choose either .pnml or .json");
        }

        if (result !== undefined) {

            this._displayService.display(result);
        }
    }
}
