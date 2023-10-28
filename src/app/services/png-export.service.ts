import { Injectable } from '@angular/core';
import { Element } from "../classes/diagram/element";
import { DisplayService } from "./display.service";

@Injectable({
  providedIn: 'root'
})

export class PngExportService {
  constructor(
      private _displayService: DisplayService
  ) {}

  private getElements(): Array<Element> {
      const result = [];
      const elements = this._displayService.diagram.elements;
      for (const element of elements) {
          result.push(element);
      }
      return result;
  }

  // Variante 1: lädt schwarzes Bild runter ...
  createPngFile() {
      // SVG-String erstellen -- eventuell später als Methodenaufruf?
      // (<svg> zu Blob, Blob zu Image,
      // Image zu Canvas, dann Download

      // Aufruf des SVG-Elements über den Selector "svg", Erhalt eines Objekts:
      const svgObject = document.querySelector("svg");
      if (!svgObject){
          return;
      }

      // Objekt in String umwandeln
      let svgString = svgObject.outerHTML;

      // Namespace für die SVG-Datei anlegen
      if (!svgString.match(/xmlns=\"/mi)){
          svgString = svgString.replace ('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ') ;
      }

      //Blob erstellen
      const svgBlob = new Blob([svgString], {type: "image/svg+xml; base64; charset=utf-8"});

      // Zuweisen der URL und Browserfehler abfangen
      const domUrl = window.URL || window.webkitURL || window;
      if (!domUrl) {
          throw new Error("(browser doesnt support this)")
      }

      // Variablen für URL und Image erstellen
      const url = domUrl.createObjectURL(svgBlob);
      const img = new Image();

      // Bild in die Variable img laden
      img.onload = function() {
          //Canvas erstellen
          const canvas = document.createElement("canvas");
          canvas.width = svgObject.width.animVal.value;
          canvas.height = svgObject.height.animVal.value;

          // Ctx erstellen
          const ctx = canvas.getContext("2d");

          if(ctx){
              // Bild erstellen
              ctx.fillStyle = "white";
              ctx.fillRect(0,0, canvas.width, canvas.height);
              ctx.drawImage(img,0,0);
              const pngUrl = canvas.toDataURL("image/png");

              //Link erstellen und zuweisen
              const a = document.createElement('a');
              a.href = pngUrl;
              a.download = 'petrinetz.png';

              //Download starten
              a.click();
              window.URL.revokeObjectURL(pngUrl);
          }
      };
      img.src = url;

      return;
  }


  // vielleicht für später:
  download(url: string, filename: string) {
      //URL für den Download zuweisen:
      const blob = new Blob([url], {type:'image/png'});
      const pngUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = pngUrl;
      a.download = filename+'.png';

      a.click();
      window.URL.revokeObjectURL(pngUrl);

      return;
  }
}
