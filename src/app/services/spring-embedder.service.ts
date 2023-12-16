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
    private _neutralDistance: number = 800;
    private _repulsionConstant: number = 1;
    private _attractionConstant: number = 1;
    private _maxIterations: number = 10;
    private _epsilon: number = 10;

   constructor(private _displayService: DisplayService) {
        console.log("SpringEmbedderService constructor called");
        this._displayService.diagram$.subscribe(diagram => {

        this._diagram = diagram;

    });
    
   }

   async apply(){
 
    
    // calculate spring forces
    let iteration = 0;
    let maxForce = Infinity;


    while(iteration < this._maxIterations && maxForce > this._epsilon){
        let coolingFactor = (this._maxIterations - iteration) / this._maxIterations 
        //coolingFactor = 1
        this.computeAdjacencyMatrix();
        for(let [ i, node] of this._diagram.nodes.entries()){
            const connectedNodes = this._adjacencyMatrix[i].filter(node => node.connected);
            console.log('connectedNodes', connectedNodes);
            const attractionX = connectedNodes.reduce((acc, curr) =>  acc + curr.xDistance, 0) / connectedNodes.length;
            const attractionY = connectedNodes.reduce((acc, curr) =>  acc + curr.yDistance, 0) / connectedNodes.length;

            const nearNodes = this._adjacencyMatrix[i].filter(nearnode => (nearnode.euclideanDistance < this._neutralDistance) && (node !== nearnode.obj));
            let repulsionX = 0;
            let repulsionY = 0;
            if(nearNodes.length > 0){
             repulsionX = nearNodes.reduce((acc, curr) =>  {
                if (curr.xDistance > 0){
                    return acc - 800 + curr.xDistance 
                } else {
                    return acc + 800 + curr.xDistance
                }
            }, 0) / nearNodes.length;

             repulsionY = nearNodes.reduce((acc, curr) =>  {
                if (curr.yDistance > 0){
                    return acc - 800 + curr.yDistance 
                } else {
                    return acc + 800 + curr.yDistance
                }
            }, 0) / nearNodes.length;
        }
          console.log('repulsionX', repulsionX, 'repulsionY', repulsionY, 'attractionX', attractionX, 'attractionY', attractionY);
          
       

            this._forceVector[i] = {x: (attractionX + repulsionX) , y: (attractionY + repulsionY)};
        }

        for( let [ i, node] of this._diagram.nodes.entries()){
            const vector = this._forceVector[i];
            console.log('vector', vector.x * coolingFactor, vector.y * coolingFactor);
            
            node.x += (vector.x * coolingFactor);
            node.y += (vector.y * coolingFactor);
            console.log('node', node.x, node.y)
            node.updateSVG()
            await new Promise(resolve => setTimeout(resolve, 15000));

        }

        maxForce = Math.max(...this._forceVector.map((curr) => Math.max(Math.abs(curr.x), Math.abs(curr.y))));
        iteration++;
    }
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
    
        console.log('adjacencyMatrix', this._adjacencyMatrix);
    }
   

 

   
}
