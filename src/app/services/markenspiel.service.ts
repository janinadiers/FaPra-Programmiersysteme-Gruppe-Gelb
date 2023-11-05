import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
  })

export class MarkenspielService {

  private choice = "...";
  private countM = 0;
  private countW= 0;
  public currentIdString= "";

  private circleMap = new Map();
  private arrowMap = new Map();

  constructor() {}


  // Den SVG-Elementen Marken und Gewichte zuweisen
  public getValues(svg: any, idString: string) {
    if(svg.outerHTML.includes('circle')){
      this.setChoice("Marken:");
      this.currentIdString = idString;
      console.log("Stelle "+idString+" ist ausgewählt und enthält "+this.circleMap.get(idString)+" Marken.");
    }
    if(svg.outerHTML.includes('line')){
      this.setChoice("Gewichte:");
      this.currentIdString = idString;
      console.log("Transition "+idString+" ist ausgewählt und enthält "+this.arrowMap.get(idString)+" Gewichte.");
    }
    return;
  }
  // Marken und Gewichte zuweisen (Button "setzen")
  public setCount(mouseEvent: MouseEvent) {
      if(mouseEvent) {
          if (this.choice == "Marken:") {
              this.circleMap.set(this.currentIdString,this.countM);
              console.log("Stelle "+this.currentIdString+": "+" enthält jetzt "+this.countM+" Marken");
          }
          if (this.choice == "Gewichte:") {
              this.arrowMap.set(this.currentIdString,this.countW);
              console.log("Transition "+this.currentIdString+": "+" enthält jetzt "+this.countW+" Gewichte");
          }
      }
      return;
  }

  // Methode "Werte zuweisen" - wird mit Button "Wert setzen" aufgerufen
  public getCount(idString: string) {
      // Abfrage für spezifisches SVG-Objekt anpassen?
    if (this.choice == "Marken:") {
      return this.countM;
    }
    else if (this.choice == "Gewichte:") {
      return this.countW;
    }
    else {
      return 0;
    }
  }

  // Marken oder Gewichte um 1 hochzählen ("+"-Button)
  public addCount(mouseEvent: MouseEvent) {
    if (this.choice == "Marken:") {
      this.countM++;
      return;
    }
    if (this.choice == "Gewichte:") {
      this.countW++;
      return;
    }
    else {
      return;
    }
  }

  // Marken oder Gewichte um 1 runterzählen ("-"-Button)
  public removeCount(mouseEvent: MouseEvent) {
    if (this.choice == "Marken:") {
      this.countM--;
      if (this.countM < 0) {
        this.countM = 0;
      }
      return;
    }
    if (this.choice == "Gewichte:") {
      this.countW--;
      if (this.countW < 0) {
        this.countW = 0;
      }
      return;
    }
    else {
      return;
    }
  }

  // Auswahl, ob Marken oder Gewichte gesetzt werden
  public setChoice(choice: string) {
        this.choice = choice;
        return;
    }
  public getChoice(){
      return this.choice;
  }
}
