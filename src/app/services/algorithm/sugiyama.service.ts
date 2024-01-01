import {Injectable} from '@angular/core';
import { Line } from 'src/app/classes/diagram/line';
import { Place } from 'src/app/classes/diagram/place';
import { Transition } from 'src/app/classes/diagram/transition';

@Injectable({
    providedIn: 'root'
})
export class SugiyamaService {

    removeBackwardEdges(transitions: Array<Transition>, places: Array<Place>, lines: Array<Line>) {
        // if (lines == undefined) 
        //     return;
        const linesCopy = { ...lines};
        
        for (const line of linesCopy) {
            const targetIsTransitions = linesCopy.filter((line) => line.target.svgElement?.childNodes[0] instanceof SVGRectElement);
            for (const targetIsTransition of targetIsTransitions) {
                const sourceIsPlace = linesCopy.filter((line) => line.target.svgElement?.childNodes[0] instanceof SVGCircleElement);
                
            }
        }
    }

}


// // Annahme: Ihr Diagramm enthält Klassen Place und Transition mit entsprechenden Eigenschaften und Beziehungen.

// function removeBackwardEdges(diagram: Diagram) {
//     // Erstellen Sie eine Kopie des Diagramms, um Änderungen vorzunehmen.
//     const diagramCopy = { ...diagram };
  
//     // Durchlaufen Sie alle Transitionen im Diagramm.
//     for (const transition of diagramCopy.transitions) {
//       // Filtern Sie die eingehenden Kanten (Verbindungen zu Orten).
//       const incomingEdges = diagramCopy.lines.filter((line) => line.target === transition);
  
//       // Durchlaufen Sie die eingehenden Kanten.
//       for (const incomingEdge of incomingEdges) {
//         // Finden Sie den zugehörigen Ort.
//         const sourcePlace = diagramCopy.places.find((place) => place === incomingEdge.source);
  
//         // Überprüfen Sie, ob der Ort in einer früheren Schicht ist als die Transition.
//         if (sourcePlace.layer < transition.layer) {
//           // Entfernen Sie die Rückwärtskante, indem Sie sie aus dem Diagramm kopieren.
//           diagramCopy.lines = diagramCopy.lines.filter((line) => line !== incomingEdge);
//         }
//       }
//     }
  
//     return diagramCopy;
//   }
  