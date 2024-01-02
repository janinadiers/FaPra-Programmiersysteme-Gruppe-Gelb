import {Injectable} from '@angular/core';
import { DisplayService } from './display.service';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';

@Injectable({
    providedIn: 'root'
})
export class SpringEmbedderService {
    
    private _diagram: any;
    private _adjacencyMatrix: Array<Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>> = [];
    private _forceVector: Array<{x: number, y: number}> = [];
    private _maxIterations: number = 10;
    private _epsilon: number = 10;
    private _idealLength: number = 40;
    private c_spring: number = 1;
    private c_rep: number = 2;
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
    
    while(iteration < this._maxIterations && maxForce > this._epsilon){
        let coolingFactor = (this._maxIterations - iteration) / this._maxIterations 
        this.computeAdjacencyMatrix();
        
        for(let [ i, node] of this._diagram.nodes.entries()){
            const connectedNodes = this._adjacencyMatrix[i].filter(node => node.connected);
            const allNodes = this._adjacencyMatrix[i]

            let attraction = this.getAttractionForce(node, connectedNodes);
            let repulsion = this.getRepulsionForce(node, allNodes);
            console.log(attraction, repulsion);
            
            this._forceVector[i] = {x: (attraction.x + repulsion.x) , y: (attraction.y + repulsion.y)};
        }
        
        for( let [ i, node] of this._diagram.nodes.entries()){
            const vector = this._forceVector[i];
            let newX = node.x + (vector.x * coolingFactor);
            let newY = node.y + (vector.y * coolingFactor);
            if(!this._scaleOfCanvas) return;
            node.x = newX
            node.y = newY
            // if(newX >= this._scaleOfCanvas.x && newX <= (this._scaleOfCanvas.x + this._scaleOfCanvas.width)){
            //     node.x = newX
            // }
            // if(newY >= this._scaleOfCanvas.y && newY <= (this._scaleOfCanvas.y + this._scaleOfCanvas.height)){
            //     node.y = newY
            // }
            node.updateSVG()
            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        maxForce = Math.max(...this._forceVector.map((elem) => Math.max(Math.abs(elem.x), Math.abs(elem.y))));
        iteration++;
    }
    }

    getAttractionForce(node: Place | Transition, connectedNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>){
        let attraction = {x: 0, y: 0};
        connectedNodes.forEach((elem) => {
            let dx = elem.obj.x - node.x;
            let dy = elem.obj.y - node.y;
            let vektorBetrag = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2)));
            let einheitsVektor =  {x: (dx * (1/vektorBetrag)), y: (dy * (1 / vektorBetrag))}
            
            attraction.x += (Math.pow(elem.euclideanDistance,2) / this._idealLength) * einheitsVektor.x;
            attraction.y += (Math.pow(elem.euclideanDistance,2) / this._idealLength) * einheitsVektor.y;
        });
        console.log('attraction', attraction);
        
        return attraction;

    }

    getRepulsionForce(node: Place | Transition, allNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>){
        let repulsion = {x: 0, y: 0};
            allNodes.forEach((elem) => {
                if(elem.obj !== node){
                    let dx = elem.obj.x - node.x;
                    let dy = elem.obj.y - node.y;
                    let vektorBetrag = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2)));
                    let einheitsVektor =  {x: (dx * (1/vektorBetrag)), y: (dy * (1 / vektorBetrag))}
                    
                    repulsion.x += (Math.pow(this._idealLength,2) / elem.euclideanDistance) * einheitsVektor.x
                    repulsion.y += (Math.pow(this._idealLength,2) / elem.euclideanDistance) * einheitsVektor.y
                    
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
            for(let child of this._diagram.nodes){
                let euclideanDistance = Math.sqrt(Math.pow((node.x - child.x), 2) + Math.pow((node.y - child.y), 2));
                let xDistance = child.x - node.x;
                let yDistance = child.y - node.y;
                let connected = node.children.indexOf(child) !== -1 || child.children.indexOf(node) !== -1;
                let obj = child
                let self = node
                
                this._adjacencyMatrix[i][this._diagram.nodes.indexOf(child)] = {euclideanDistance, xDistance, yDistance, connected, obj, self};
            }
        }
    
    }
}
