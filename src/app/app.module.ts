import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DisplayComponent } from './components/display/display.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './components/footer/footer.component';
import { ExampleFileComponent } from './components/example-file/example-file.component';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ExampleButtonComponent } from './components/example-button/example-button.component';
import { ImportButtonComponent } from './components/import-button/import-button.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PngExportButtonComponent } from './components/png-export-button/png-export-button.component';
import { ExportButtonComponent} from "./components/export-button/export-button.component";
import { ExportSvgButtonComponent } from './components/export-svg-button/export-svg-button.component';
import { ExportJsonButtonComponent } from './components/export-button-json/export-button-json.component';


@NgModule({
    declarations: [
        AppComponent,
        DisplayComponent,
        FooterComponent,
        ExampleFileComponent,
        ExampleButtonComponent,
        ToolbarComponent,
        ExportSvgButtonComponent,
        ImportButtonComponent,
        PngExportButtonComponent,
        ExportButtonComponent,
        ExportJsonButtonComponent,
    ],
    imports: [
        BrowserModule,
        FlexLayoutModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatToolbarModule,
    ],
    providers: [
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
