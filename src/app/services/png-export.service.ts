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
      let elements = this.getElements();
      console.log(elements);
      console.log(elements[0]);
      console.log(elements[1]);

      //Kurzanleitung: <svg> zu Blob, Blob zu Image, Image zu Canvas, dann Download
      //<svg> zu Blob

      let svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">`;

      for (const element of elements) {
          if (element._svgElement?.tagName === 'circle') {
              svgString += `<place id="${element.id}">\n<name>\n<text>name="${element.id}"</text>\n</name>\n<graphics>\n<position x="${element.x}" y="${element.y}"/>\n</graphics>\n<initialMarking>\n<text>0</text>\n</initialMarking>\n</place>`;
          } else if (element._svgElement?.tagName === 'rect') {
              svgString += `<transition id="${element.id}"><name><text>"${element.id}"</text></name><graphics><position x="${element.x}" y="${element.y}"/></graphics></transition>`;
          } else if (element._svgElement?.tagName === 'line') {
              svgString += `<arc id="${element.id}" source="${element.id}" target="${element.id}"><graphics><position x="${element.x}" y="${element.y}"/></graphics></arc>`;
          }
      }
      svgString += '</svg>';

      var svgTest = document.querySelector("svg");
      console.log("SVG-Test: "+svgTest);

      var svg = new Blob([svgString], {type: "image/svg+xml; base64; charset=utf-8"});

      //Blob zu Image
      var domUrl = window.URL || window.webkitURL || window;
      if (!domUrl) {
          throw new Error("(browser doesnt support this)")
      }

      var url = domUrl.createObjectURL(svg);
      var img = new Image();

      // Image zu Canvas
      // Namespace für die Datei anlegen
      if (!svgString.match(/xmlns=\"/mi)){
          svgString = svgString.replace ('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ') ;
      }

      var canvas = document.createElement("canvas");
      canvas.width = Number("1200");
      canvas.height = Number("600");
      var ctx = canvas.getContext("2d");

      img.onload = function() {
          if(ctx){
              ctx.drawImage(img,0,0);
          }
      }

      // domUrl.revokeObjectURL(url);
      var resolvedImg = canvas.toDataURL("image/png");
      console.log(resolvedImg);

      img.src = 'data:image/svg+xml;base64,'+btoa('inline svg');

      console.log(img.src);
      console.log(url);

      //URL für den Download zuweisen:
      const blob = new Blob([resolvedImg], {type:'text/xml'});
      const pngUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = resolvedImg;
      a.download = 'petrinetz.png';

      a.click();
      window.URL.revokeObjectURL(pngUrl);

      return;
  }

  // Variante 2: holt svg-Element aus dem Dokument, gibt aber keine lesbare PNG aus (kein Header)
  createPng2() {
      let elements = this.getElements();
      var svgTest = document.querySelector('svg');
      console.log("SVG-Test: ", svgTest); //wenn +, dann Objekt :-)

      var s = new XMLSerializer();

      if(!svgTest){
          return;
      }

      //Blob erstellen
      var svg = new Blob([svgTest.outerHTML], {type: "image/svg+xml; base64; charset=utf-8"});
      console.log(svg);

      // URL-Object erstellen
      var domUrl = window.URL || window.webkitURL || window;
      if (!domUrl) {
          throw new Error("(browser doesnt support this)")
      }

      //Blob zu Image
      var url = domUrl.createObjectURL(svg);
      var img = new Image();

      var canvas = document.createElement("canvas");
      canvas.width = Number(svgTest.width);
      canvas.height = Number(svgTest.height);
      var ctx = canvas.getContext("2d");

      img.onload = function() {
          if(ctx){
              ctx.drawImage(img,0,0);
          }
      }

      img.src = 'data:image/svg+xml;base64,'+btoa('inline svg'); // ggf tauschen
      //Oder: img.src = url;
      //URL für den Download zuweisen:
      const blob = new Blob([url], {type:'image/png'});
      const pngUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = pngUrl;
      a.download = 'petrinetz.png';

      a.click();
      window.URL.revokeObjectURL(pngUrl);

      return;
  }

  // für später:
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
