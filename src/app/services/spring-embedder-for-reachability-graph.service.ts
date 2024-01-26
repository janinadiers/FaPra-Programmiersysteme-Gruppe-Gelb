
import {Injectable} from '@angular/core';
import {State} from '../classes/diagram/state';

type TAdjacencyMatrix = Array<Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: State, self: State}>>;

@Injectable({
    providedIn: 'root'
})

export class SpringEmbedderService {
    
    private _forceVector: Array<{x: number, y: number}> = [];
    private _maxIterations: number = 120;
    private _millisecondsBetweenRenderSteps: number = 0;
    private _epsilon: number = 20;
    private _forceFactor : number = 0.055
    private _idealLength: number = 80;
    private _scaleOfCanvas: {x: number, y:number, width: number, height: number} | undefined = undefined;
    private _activeNode: State | undefined = undefined;
    private _maxForce: number = 2_000;
    private _minForce: number = -2_000;

   async apply(nodes:State[]){
    
    this._scaleOfCanvas = document.getElementById('canvas')?.getBoundingClientRect();
    
    let iteration = 0;
    let maxForce = Infinity;
    
    while(iteration < this._maxIterations && maxForce > this._epsilon){
        let coolingFactor = Math.log(this._maxIterations - iteration ) / Math.log(this._maxIterations );
     
        let adjacencyMatrix:TAdjacencyMatrix = this.computeAdjacencyMatrix(nodes);
        
        for(let [ i, node] of nodes.entries()){

            const connectedNodes = adjacencyMatrix[i].filter(node => node.connected);
            const allNodes = adjacencyMatrix[i]
            
            let attraction = this.getAttractionForce(node, connectedNodes);
            let repulsion = this.getRepulsionForce(node, allNodes);

            let forceX =  attraction.x + repulsion.x
            let forceY = attraction.y + repulsion.y;
            
            if(forceX >= this._maxForce){
                forceX = this._maxForce
            }
            if(forceX <= this._minForce){
                forceX = this._minForce
            }
            if(forceY >= this._maxForce){
                forceY = this._maxForce
            }
            if(forceY <= this._minForce){
                forceY = this._minForce
            }
            
            this._forceVector[i] = {x: forceX , y: forceY};
        }
        
        for( let [ i, node] of nodes.entries()){
            const vector = this._forceVector[i];
            
            let newX = node.x + (vector.x * coolingFactor * this._forceFactor);
            let newY = node.y + (vector.y * coolingFactor * this._forceFactor);
            if(!this._scaleOfCanvas) return;
            if(node !== this._activeNode){
                
                node.x = newX
                node.y = newY
                node.updateState();
            } 
            
            

        }
        await new Promise(resolve => setTimeout(resolve, this._millisecondsBetweenRenderSteps));

        maxForce = Math.max(...this._forceVector.map((elem) => Math.max(Math.abs(elem.x), Math.abs(elem.y))));
        iteration++;
    }
   
    }

    getAttractionForce(node: State, connectedNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: State, self: State}>){
        let attraction = {x: 0, y: 0};
       
        connectedNodes.forEach((elem) => {
            
            const diffX = Math.abs(elem.obj.x - node.x);
            const diffY = Math.abs(elem.obj.y - node.y);
            let dx = node.x > elem.obj.x ? -diffX : diffX;
            let dy = node.y > elem.obj.y ? -diffY : diffY;
            let vektorBetrag = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2))) <= 1 ? 1 : Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2)));
            let einheitsVektor =  {x: (dx * (1/vektorBetrag)), y: (dy * (1 / vektorBetrag))}

            attraction.x += ((Math.pow(elem.euclideanDistance,2) / this._idealLength) * einheitsVektor.x);
            attraction.y += ((Math.pow(elem.euclideanDistance,2) / this._idealLength) * einheitsVektor.y);
        });
        
        return attraction;

    }

    getRepulsionForce(node: State, allNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: State, self: State}>){
        let repulsion = {x: 0, y: 0};
            allNodes.forEach((elem) => {
                if(elem.obj !== node){
                    const diffX = Math.abs(elem.obj.x - node.x);
                    const diffY = Math.abs(elem.obj.y - node.y);
                    let dx = node.x > elem.obj.x ? diffX : -diffX;
                    let dy = node.y > elem.obj.y ? diffY : -diffY;
                    let vektorBetrag = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2))) <= 1 ? 1 : Math.sqrt((Math.pow(dx, 2) + Math.pow(dy,2)));
                    let einheitsVektor =  {x: (dx * (1/vektorBetrag)), y: (dy * (1 / vektorBetrag))}
                    const eucleadianDistance = elem.euclideanDistance <= 1 ? 1 : elem.euclideanDistance;
                    repulsion.x += (Math.pow(this._idealLength,2) / eucleadianDistance) * einheitsVektor.x
                    repulsion.y += (Math.pow(this._idealLength,2) / eucleadianDistance) * einheitsVektor.y  
                } 
            })
            
        return repulsion;
    }

    computeAdjacencyMatrix(nodes:State[]):TAdjacencyMatrix{
        let adjacencyMatrix:TAdjacencyMatrix = [];
        for(let [i, node] of nodes.entries()){
            if ( adjacencyMatrix[i] === undefined){
                adjacencyMatrix[i] = [];
            }
            for(let node2 of nodes){
                let euclideanDistance = Math.sqrt(Math.pow((node.x - node2.x), 2) + Math.pow((node.y - node2.y), 2));
                let xDistance = node2.x - node.x;
                let yDistance = node2.y - node.y;
                let connected = node.parents.indexOf(node2) !== -1 || node2.parents.indexOf(node) !== -1;
                let obj = node2
                let self = node
                
                adjacencyMatrix[i][nodes.indexOf(node2)] = {euclideanDistance, xDistance, yDistance, connected, obj, self};
            }
        }
        return adjacencyMatrix;
    
    }

     
}
