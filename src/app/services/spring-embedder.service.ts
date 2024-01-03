
import {Injectable} from '@angular/core';
import { DisplayService } from './display.service';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import { inRange} from 'lodash';

type TAdjacencyMatrix = Array<Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>>;

@Injectable({
    providedIn: 'root'
})

export class SpringEmbedderService {
    
    private _diagram: any;
    private _forceVector: Array<{x: number, y: number}> = [];
    private _maxIterations: number = 16;
    private _millisecondsBetweenRenderSteps: number = 0;
    private _epsilon: number = 20;
    private _forceFactor : number = 0.055
    private _idealLength: number = 80;
    private _debounceMS : number = 0
    private _scaleOfCanvas: {x: number, y:number, width: number, height: number} | undefined = undefined;
    private _activeNode: Place | Transition | undefined = undefined;
    private handlers = new Map();

   constructor(private _displayService: DisplayService) {
        this.processMouseDown = this.processMouseDown.bind(this);
        this.processMouseUp = this.processMouseUp.bind(this);
        this.processMouseMove = this.processMouseMove.bind(this);
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
     
        let adjacencyMatrix:TAdjacencyMatrix = this.computeAdjacencyMatrix();
        
        for(let [ i, node] of this._diagram.nodes.entries()){

            const connectedNodes = adjacencyMatrix[i].filter(node => node.connected);
            const allNodes = adjacencyMatrix[i]
            
            let attraction = this.getAttractionForce(node, connectedNodes);
            let repulsion = this.getRepulsionForce(node, allNodes);

            let forceX =  attraction.x + repulsion.x
            let forceY = attraction.y + repulsion.y;
            
            if(forceX >= 2_000){
                forceX = 2_000
            }
            if(forceX <= -2_000){
                forceX = -2_000
            }
            if(forceY >= 2_000){
                forceY = 2_000
            }
            if(forceY <= -2_000){
                forceY = -2_000
            }
            
            this._forceVector[i] = {x: forceX , y: forceY};
        }
        
        for( let [ i, node] of this._diagram.nodes.entries()){
            const vector = this._forceVector[i];
            
            let newX = node.x + (vector.x * coolingFactor * this._forceFactor);
            let newY = node.y + (vector.y * coolingFactor * this._forceFactor);
            if(!this._scaleOfCanvas) return;
            if(node !== this._activeNode){
                node.x = newX
                node.y = newY
                node.updateSVG()
            } 
            
            await new Promise(resolve => setTimeout(resolve, this._millisecondsBetweenRenderSteps));

        }

        maxForce = Math.max(...this._forceVector.map((elem) => Math.max(Math.abs(elem.x), Math.abs(elem.y))));
        iteration++;
    }
    //this._isRunning = false;
    }

    getAttractionForce(node: Place | Transition, connectedNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>){
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

    getRepulsionForce(node: Place | Transition, allNodes: Array<{euclideanDistance: number, xDistance: number, yDistance: number, connected: boolean, obj: Place | Transition, self: Place | Transition}>){
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

    computeAdjacencyMatrix():TAdjacencyMatrix{
        let adjacencyMatrix:TAdjacencyMatrix = [];
        for(let [i, node] of this._diagram.nodes.entries()){
            if ( adjacencyMatrix[i] === undefined){
                adjacencyMatrix[i] = [];
            }
            for(let node2 of this._diagram.nodes){
                let euclideanDistance = Math.sqrt(Math.pow((node.x - node2.x), 2) + Math.pow((node.y - node2.y), 2));
                let xDistance = node2.x - node.x;
                let yDistance = node2.y - node.y;
                let connected = node.children.indexOf(node2) !== -1 || node2.children.indexOf(node) !== -1;
                let obj = node2
                let self = node
                
                adjacencyMatrix[i][this._diagram.nodes.indexOf(node2)] = {euclideanDistance, xDistance, yDistance, connected, obj, self};
            }
        }
        return adjacencyMatrix;
    
    }

    start() {
        this._diagram.nodes.forEach((node: Place | Transition) => {
            node.lastMouseMove = 0;
            node.isSelected = false
            const mouseMoveHandler = this.createMouseMoveHandler(node);
            this.handlers.set(`${node.id}-mouseMove`, mouseMoveHandler);
            const mouseDownHandler = this.createMouseDownHandler(node);
            this.handlers.set(`${node.id}-mouseDown`, mouseDownHandler);
            const mouseUpHandler = this.createMouseUpHandler(node);
            this.handlers.set(`${node.id}-mouseUp`, mouseUpHandler);
            node.svgElement?.addEventListener('mousedown', mouseDownHandler);
            node.svgElement?.addEventListener('mouseup', mouseUpHandler);
            node.svgElement?.addEventListener('mousemove', mouseMoveHandler);
        });

        this.apply();

    }

    createMouseMoveHandler(node: Place | Transition) {
        return (event:MouseEvent) => {
            this.processMouseMove(event, node);
        };
    }

    createMouseDownHandler(node: Place | Transition) {
        return (event:MouseEvent) => {
            this.processMouseDown(node);
        };
    }

    createMouseUpHandler(node: Place | Transition) {
        return (event:MouseEvent) => {
            this.processMouseUp(node);
        };
    }

    processMouseDown(node: Place | Transition) {
        this._activeNode = node;
        node.isSelected = true
    }
    processMouseUp(node: Place | Transition) {
        node.isSelected = false
    }
    processMouseMove(event: MouseEvent, node: Place | Transition) {
        if(inRange(event.clientX, this._scaleOfCanvas!.x, this._scaleOfCanvas!.x + this._scaleOfCanvas!.width) && inRange(event.clientY, this._scaleOfCanvas!.y, this._scaleOfCanvas!.y + this._scaleOfCanvas!.height)){

            if (!node.isSelected || Date.now() - node.lastMouseMove < this._debounceMS ) {
                return;
            }
            node.lastMouseMove = Date.now();
            this.apply();
            
        }
    }

    teardown() {
        //remove event listeners
        this._diagram.nodes.forEach((node: any) => {
            
            const handler1 = this.handlers.get(`${node.id}-mouseMove`);
            const handler2 = this.handlers.get(`${node.id}-mouseDown`);
            const handler3 = this.handlers.get(`${node.id}-mouseUp`);

            node.svgElement?.removeEventListener('mousedown', handler2);
            node.svgElement?.removeEventListener('mouseup', handler3);
            node.svgElement?.removeEventListener('mousemove', handler1);
        });
    }

    
}
