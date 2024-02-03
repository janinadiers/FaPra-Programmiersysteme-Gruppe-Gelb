
import {Injectable} from '@angular/core';
import { DisplayService } from './display.service';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import { Diagram } from '../classes/diagram/diagram';

@Injectable({
    providedIn: 'root'
})
export class FreiAlgorithmusService {
    
    private _diagram: Diagram | undefined;
    private _isDragging = false;
    private _selectedNode: Place | Transition | undefined = undefined;

   constructor(private _displayService: DisplayService) {
        
        this._displayService.diagram$.subscribe(diagram => {
        this._diagram = diagram;

    });
    
   }

    start() {
        
        this._diagram?.nodes.forEach((node: Place|Transition) => {
            
            if(!node.svgElement) return;
            
            node.svgElement.addEventListener('mousedown', (event) => {
                Diagram.algorithmIsActive = false;
                this._selectedNode = node;
                event.stopPropagation();
                this.processMouseDown(node.svgElement);
            });
           
        });
        
        
        window.addEventListener('mouseup', (event) => {
                
            event.stopPropagation();
            if(!this._selectedNode) return;
            this.processMouseUp(this._selectedNode.svgElement);
        });
        window.addEventListener('mousemove', (event) => {
            event.stopPropagation();
            
            if(!this._selectedNode) return;
            this.processMouseMove(event, this._selectedNode);
        })
        
       

    }

    private processMouseDown(svgElement: SVGElement | undefined) {
        
        if (svgElement === undefined) {
            return;
        }

        // Wenn Toolbar aktiv, dann kein Dragging
        if(Diagram.drawingIsActive){
            return;
        }
        this._isDragging = true;
       
        
    }

    private processMouseUp(svgElement: SVGElement | undefined) {
        
        if (svgElement === undefined) {
            return;
        }
        
        if (this._isDragging) {
            
            this._isDragging = false;       

        }
    
        
        
    }

    private processMouseMove(event: MouseEvent, node: Place | Transition) {
        
        if (node.svgElement === undefined) {
            return;
        }

        if (this._isDragging) {
            
            
            const sugiyamaButton = document.querySelector('.sugiyama') as HTMLElement;
            Diagram.algorithmIsActive = true;
            const svgElement = document.getElementById('canvas');
            const svgContainer = svgElement?.getBoundingClientRect();
            // Berechnung der Maus Koordinanten relativ zum SVG Element
            if (!sugiyamaButton.classList.contains('selected'))
                node.x = ((event.clientX - svgContainer!.left) * Diagram.zoomFactor) + Diagram.viewBox!.x;
            node.y = ((event.clientY - svgContainer!.top) * Diagram.zoomFactor) + Diagram.viewBox!.y;
            
            node.updateSVG();

        }
    }
    
}
