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
    private _neutralDistance: number = 1;
    private _repulsionConstant: number = 1;
    private _attractionConstant: number = 1;
    private _maxIterations: number = 100;
    private _epsilon: number = 10;
    //private _widthOfCanvas: number = document.getElementById('canvas')!.clientWidth;
    //private _heightOfCanvas: number = document.getElementById('canvas')!.clientHeight;

   constructor(private _displayService: DisplayService) {
        console.log("SpringEmbedderService constructor called");
        this._displayService.diagram$.subscribe(diagram => {

        this._diagram = diagram;
        //this._neutralDistance = Math.sqrt((this._widthOfCanvas * this._heightOfCanvas) /this._diagram.nodes.length);

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
            // const attractionX = connectedNodes.reduce((acc, curr) =>  acc + curr.xDistance, 0) / connectedNodes.length;
            // const attractionY = connectedNodes.reduce((acc, curr) =>  acc + curr.yDistance, 0) / connectedNodes.length;
            const attraction = connectedNodes.reduce((acc, curr) =>  acc + (2 * Math.log(curr.euclideanDistance)), 0);
            console.log('jhkfjds', (this._adjacencyMatrix[1][0].euclideanDistance));
            
            const repulsion = this._adjacencyMatrix[i].reduce((acc, curr) => {
                if(curr.obj !== node){
                    return acc + (1 / Math.pow(curr.euclideanDistance,2))
                }
                return acc;
            }, 0)
                
                
            console.log('repulsion', repulsion, 'attraction', attraction);
            
            this._forceVector[i] = {x: (attraction + repulsion) , y: (attraction+ repulsion)};
    }
        

        for( let [ i, node] of this._diagram.nodes.entries()){
            const vector = this._forceVector[i];
            console.log('vector', vector);
            
            node.x += (vector.x * 0.1);
            node.y += (vector.y * 0.1);
            node.updateSVG()
            //await new Promise(resolve => setTimeout(resolve, 10000));

        }

        maxForce = Math.max(...this._forceVector.map((curr) => Math.max(Math.abs(curr.x), Math.abs(curr.y))));
        iteration++;
    }
    }

    getAttractionForce(absoluteDistance:[number,number] ){
        let absoluteDistanceX = absoluteDistance[0];
        let absoluteDistanceY = absoluteDistance[1];
        return [(Math.pow(absoluteDistanceX,2) / this._neutralDistance), (Math.pow(absoluteDistanceY,2) / this._neutralDistance)];
    }

    getRepulsionForce(absoluteDistance:[number,number]){
        let absoluteDistanceX = absoluteDistance[0];
        let absoluteDistanceY = absoluteDistance[1];
        return [(Math.pow(this._neutralDistance,2) / absoluteDistanceX), (Math.pow(this._neutralDistance,2) / absoluteDistanceY)];
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
