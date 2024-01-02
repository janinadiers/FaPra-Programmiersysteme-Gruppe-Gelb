
import {Injectable} from '@angular/core';
import { DisplayService } from './display.service';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import { last } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SpringEmbedderService {
    
    private _diagram: any;
    private _adjacencyMatrix: Array<Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>> = [];
    private _forceVector: Array<{x: number, y: number}> = [];
    private _maxIterations: number = 20;
    private _millisecondsBetweenRenderSteps: number = 1;
    private _epsilon: number = 10;
    private _idealLength: number = 80;
    private _scaleOfCanvas: {x: number, y:number, width: number, height: number} | undefined = undefined;

   constructor(private _displayService: DisplayService) {
        this._displayService.diagram$.subscribe(diagram => {
        this._diagram = diagram;

    });
    
   }

   async apply(){
    this._scaleOfCanvas = document.getElementById('canvas')?.getBoundingClientRect();
    
    let iteration = 0;
    let maxForce = Infinity;

    this._diagram.lines.forEach((line: any) => {line.removeCoords()});
    
    while(iteration < this._maxIterations && maxForce > this._epsilon){
        let coolingFactor = Math.log(this._maxIterations - iteration ) / Math.log(this._maxIterations );
        this.computeAdjacencyMatrix();
        
        for(let [ i, node] of this._diagram.nodes.entries()){
            const connectedNodes = this._adjacencyMatrix[i].filter(node => node.connected);
            const allNodes = this._adjacencyMatrix[i]
            console.log('allNodes', allNodes);
            console.log('allNodes', allNodes);
            
            let attraction = this.getAttractionForce(node, connectedNodes);
            let repulsion = this.getRepulsionForce(node, allNodes);
            console.log('attraction', attraction, 'repulsion', repulsion);
            
            this._forceVector[i] = {x: (attraction.x + repulsion.x ?? 0) , y: (attraction.y + repulsion.y)};
        }
        
        for( let [ i, node] of this._diagram.nodes.entries()){
            const vector = this._forceVector[i];
            console.log('vector', vector)
            let newX = node.x + (vector.x * coolingFactor * 0.06);
            let newY = node.y + (vector.y * coolingFactor * 0.06);
            if(!this._scaleOfCanvas) return;
            node.x = newX
            node.y = newY
            // if((newX >= this._scaleOfCanvas.x) && (newX <= (this._scaleOfCanvas.x + this._scaleOfCanvas.width))){
            //     node.x = newX
            // }
            // if((newY >= this._scaleOfCanvas.y) && (newY <= (this._scaleOfCanvas.y + this._scaleOfCanvas.height))){
            //     node.y = newY
            // }
            node.updateSVG()
            await new Promise(resolve => setTimeout(resolve, this._millisecondsBetweenRenderSteps));

        }

        maxForce = Math.max(...this._forceVector.map((elem) => Math.max(Math.abs(elem.x), Math.abs(elem.y))));
        iteration++;
    }
    }

    getAttractionForce(node: Place | Transition, connectedNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>){
        let attraction = {x: 0, y: 0};
        console.log('connectedNodes', connectedNodes);
        connectedNodes.forEach((elem) => {
            const diffX = Math.abs(elem.obj.x - node.x);
            const diffY = Math.abs(elem.obj.y - node.y);
            let dx = node.x > elem.obj.x ? -diffX : diffX;
            let dy = node.y > elem.obj.y ? -diffY : diffY;
            let vektorBetrag = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2))) < 1 ? 1 : Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2)));
            let einheitsVektor =  {x: (dx * (1/vektorBetrag)), y: (dy * (1 / vektorBetrag))}

            console.log('node', node)
            console.log('elem', elem.obj)
            console.log('einheitsVektor', einheitsVektor)
            console.log('vektorBetrag', vektorBetrag)
            console.log('eucleadianDistance', elem.euclideanDistance)
            console.log('dx', dx)
            console.log('dy', dy)
            
            attraction.x += ((Math.pow(elem.euclideanDistance,2) / this._idealLength) * einheitsVektor.x);
            attraction.y += ((Math.pow(elem.euclideanDistance,2) / this._idealLength) * einheitsVektor.y);
        });
        console.log('attraction', attraction);
        
        return attraction;

    }

    getRepulsionForce(node: Place | Transition, allNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>){
        let repulsion = {x: 0, y: 0};
            allNodes.forEach((elem) => {
                if(elem.obj !== node){
                    const diffX = Math.abs(elem.obj.x - node.x);
                    const diffY = Math.abs(elem.obj.y - node.y);
                    let dx = node.x > elem.obj.x ? diffX : -diffX;
                    let dy = node.y > elem.obj.y ? diffY : -diffY;
                    let vektorBetrag = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2))) < 1 ? 1 : Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2)));
                    let einheitsVektor =  {x: (dx * (1/vektorBetrag)), y: (dy * (1 / vektorBetrag))}
                    const eucleadianDistance = elem.euclideanDistance < 1 ? 1 : elem.euclideanDistance;
                    repulsion.x += (Math.pow(this._idealLength,2) / eucleadianDistance) * einheitsVektor.x
                    repulsion.y += (Math.pow(this._idealLength,2) / eucleadianDistance) * einheitsVektor.y  
                } 
            })
            console.log('repulsion', repulsion);
            
        return repulsion;
    }

    computeAdjacencyMatrix(){
        for(let [i, node] of this._diagram.nodes.entries()){
            if ( this._adjacencyMatrix[i] === undefined){
                this._adjacencyMatrix[i] = [];
            }
            for(let node2 of this._diagram.nodes){
                let euclideanDistance = Math.sqrt(Math.pow((node.x - node2.x), 2) + Math.pow((node.y - node2.y), 2));
                let xDistance = node2.x - node.x;
                let yDistance = node2.y - node.y;
                let connected = node.children.indexOf(node2) !== -1 || node2.children.indexOf(node) !== -1;
                let obj = node2
                let self = node
                
                this._adjacencyMatrix[i][this._diagram.nodes.indexOf(node2)] = {euclideanDistance, xDistance, yDistance, connected, obj, self};
            }
        }
    
    }

    start() {
        this._diagram.nodes.forEach((node: any) => {
            let lastMouseMove = 0;
            let isSelected = false
            node._svgElement?.addEventListener('mousedown', (event: MouseEvent) => {
               isSelected = true
            });
            node._svgElement?.addEventListener('mouseup', (event: MouseEvent) => {
                isSelected = false
             });
            node._svgElement?.addEventListener('mousemove', (event: MouseEvent) => {
                if (!isSelected || Date.now() - lastMouseMove < 500 ) {
                    return;
                }
                lastMouseMove = Date.now();
                this.apply();
            });
        });
        this.apply();

    }

    
}
