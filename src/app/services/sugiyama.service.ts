import {Injectable} from '@angular/core';
import { Diagram } from 'src/app/classes/diagram/diagram';
import { Line } from '../classes/diagram/line';
import { Coords } from '../classes/json-petri-net';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';

@Injectable({
    providedIn: 'root',
})

export class SugiyamaService {
    diagram: Diagram = new Diagram([], []);
    layers: Element[][] = [];
    removedLines: Line[] = [];
    usedEdges: Coords[] = [];
    
    layerWidth = 100;
    nodeHeight = 100;

    public begin(diagram: Diagram) {
        this.diagram = diagram;
        this.removedLines = [];
        this.layers = [];
        this.removedLines = [];
        this.usedEdges = [];
        
        this.removeLoops();
        this.addLayers();
        this.removeLowerDirectedLines();
        this.revertLoops();
        this.removeAllIntermediateCoords();
        this.assignCoordinates();
        this.routeEdges(); 
        this.minimizeCrossings();
        // this.reduceCrossings();
        this.assignCoordinates();
    }
    
    //Step 1: Temporarely remove lines which result in a loop and save them for later push within removedLines
    removeLoops() {
        let stack = new Set<Element>();
        let marked = new Set<Element>();

        let elements = this.diagram.places.map((place) => place as unknown as Element);
        elements.concat(this.diagram.transitions.map((transition) => transition as unknown as Element));
        
        //loop through every element and call dfsRemove
        elements.forEach((element) => {
            this.dfsRemove(element, stack, marked)
        })
    }

    // Step 2: BFS (Breadth-first search) for layer assignment
    addLayers() {
        this.layers = []; 
        let visited = new Set<Element>(); // To keep track of visited nodes
        let queue: Element[] = [];

        //Convert initialLayer of Place[] to Element[]
        let initialLayer: Element[] = [];
        initialLayer = this.diagram.places.filter((place) => place.parents.length == 0).map(place => place as unknown as Element); // Assumption that a Petrinet is starting with a place and does not have any parents
        if (initialLayer.length === 0)
            initialLayer = this.diagram.places.filter((place) => place.id == this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].id).map(place => place as unknown as Element);  // Assumption that a Petrinet is starting with the lowest place.id

        this.layers.push(initialLayer);
        initialLayer.forEach(elem => {
            visited.add(elem);
            queue.push(elem);
        });

        // Continue with alternating layers of transitions and places
        while (queue.length > 0) {
            let currentLayer: Element[] = [];
            let nextQueue: Element[] = [];

            for (let elem of queue) {
                let connectedElements = this.getConnectedElements(elem).filter(e => !visited.has(e));

                for (let connectedElem of connectedElements) {
                    if (!visited.has(connectedElem)) {
                        visited.add(connectedElem);
                        currentLayer.push(connectedElem as Element);
                        nextQueue.push(connectedElem as Element);

                        if (connectedElem instanceof Transition) {
                            let transition = connectedElem as Transition;
                            let coord = { 
                                x: transition.x, 
                                y: transition.y
                            };
                            this.usedEdges.push(coord);
                        } else if (connectedElem instanceof Place) {
                            let place = connectedElem as Place;
                            let coord = { 
                                x: place.x, 
                                y: place.y
                            };
                            this.usedEdges.push(coord);
                        }
                        this.usedEdges.push();
                    }
                }
            }

            if (currentLayer.length > 0) {
                this.layers.push(currentLayer); // Add new layer
            }

            queue = nextQueue; // Prepare next layer
        }
    }

    // Step 3: Reorder layers based on connections
    removeLowerDirectedLines() {
        // check if line is directed towards lower layer, if yes -> set target on layer above (loop)
        let visited = new Set<Element[]>();

        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            for (let j = 0; j < layer.length; j++) {
                // check attached outgoing lines
                let elementID = layer[j].id;
                let currentLines = this.diagram.lines.filter((line) => line.source.id == elementID);

                currentLines.forEach(currentLine => {
                    if (i > 0) {
                        // if target is on lower layer -> set target on layer above (+1) 
                        let target = this.layers[i-1].find((target) => target.id == currentLine?.target.id) as Element;                        
                        if (target) {
                            if (this.layers[i+1]) {
                                //add target to layer[i+1]
                                this.layers[i+1].push(target);

                                this.layers[i-1].splice(this.layers[i-1].indexOf(target, 0), 1);
                            } else {
                                //create new layer and add target to layer[i+1]
                                let newLayer: Element[] = [];
                                newLayer.push(target);
                                this.layers.push(newLayer);

                                this.layers[i-1].splice(this.layers[i-1].indexOf(target, 0), 1);
                            }
                        }
                    }
                })
            }
        }
    }

    // Step 4: Add previously removed lines to avoid breaking the petrinet
    revertLoops() {
        this.removedLines.forEach((line) => {
            this.diagram.lines.push(line);
        })
    }

    // Step 5: Remove all intermediate Coords
    removeAllIntermediateCoords() {
        this.diagram.lines.forEach((line) => {
            if (line.coords)
                line.coords = [];
        });
    }

    // Step 6: Edge Routing
    routeEdges() {
        // Route edges as PolyLine (add line-points on Layer)

        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            for (let j = 0; j < layer.length; j++) {
                let elementID = layer[j].id;
                let currentLines = this.diagram.lines.filter((line) => line.source.id == elementID);

                currentLines.forEach(currentLine => {
                    const targetLayer = this.layers.findIndex(s => s.some(o => o.id === currentLine.target.id));
                    if (i + 1 != targetLayer && i - 1 != targetLayer) {
                        let nextLayerLength = this.layers[i+1].length + 1;
                        let intermediateLayers = targetLayer -  i;

                        let coords: Coords[] = [];

                        if (intermediateLayers > 0) {
                            for (let c = 1; c < intermediateLayers; c++) {
                                let xCoord = (currentLine.source.x) + c * this.layerWidth;
                                let yCoord = (currentLine.source.y);
                                if (layer.length + 1 == nextLayerLength)
                                    yCoord = (currentLine.source.y) - 1 * this.nodeHeight;
    
                                let coord = { x: xCoord, y: yCoord };
                                while (this.usedEdges.find(edge => (edge.x == coord.x && edge.y == coord.y) || (edge.x == coord.y && edge.y == coord.x))) {
                                    if (layer.length + 1 == nextLayerLength)
                                        coord.y = (coord.y) - 1 * this.nodeHeight;
                                    else 
                                        coord.y = (coord.y) + 1 * this.nodeHeight;
                                }
                                coords.push(coord);
                                this.usedEdges.push(coord);
                            }
                        } else {
                            intermediateLayers = i - targetLayer;
                            for (let c = 1; c < intermediateLayers; c++) {
                                let xCoord = (currentLine.source.x) - c * this.layerWidth;
                                let yCoord = (currentLine.source.y);
                                if (layer.length + 1 == nextLayerLength)
                                    yCoord = (currentLine.source.y) - 1 * this.nodeHeight;
    
                                let coord = { x: xCoord, y: yCoord };
                                while (this.usedEdges.find(edge => (edge.x == coord.x && edge.y == coord.y) || (edge.x == coord.y && edge.y == coord.x))) {
                                    if (layer.length + 1 == nextLayerLength)
                                        coord.y = (coord.y) - 1 * this.nodeHeight;
                                    else
                                        coord.y = (coord.y) + 1 * this.nodeHeight;
                                }
                                coords.push(coord);
                                this.usedEdges.push(coord);
                            }
                        }
                        currentLine.coords = coords;
                    }
                })
            }
        }
    }

    // Step 7: Reduce crossings using the barycenter heuristic
    minimizeCrossings() {
        let changed = true;
        while (changed) {
            const prevElements = this.diagram.places.map(element => { element.position }).concat(this.diagram.transitions.map(element => { element.position }));
            this.orderByBarycenter('place');
            this.orderByBarycenter('transition');
            const newElements = this.diagram.places.map(element => { element.position }).concat(this.diagram.transitions.map(element => { element.position }));

            changed = !prevElements.every((pos, idx) => pos === newElements[idx]);
        }
    }

    // Step 7: Reduce crossings using the barycenter heuristic
    reduceCrossings() {
        let improved = true;
        let iterationCount = 0;

        while (improved && iterationCount < 100) {
            improved = false; // Reset flag for this iteration
            iterationCount++;

            // Perform one downward sweep (top to bottom)
            for (let i = 0; i < this.layers.length - 1; i++) {
                improved = this.orderLayerByBarycenter(this.layers[i], this.layers[i + 1]) || improved;
            }

            // Perform one upward sweep (bottom to top)
            for (let i = this.layers.length - 1; i > 0; i--) {
                improved = this.orderLayerByBarycenter(this.layers[i], this.layers[i - 1]) || improved;
            }
        }
    }

    // Step 8: Assign coordinates to each element
    assignCoordinates() {
        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            for (let j = 0; j < layer.length; j++) {
                let elementID = layer[j].id;
                this.diagram.places.find((place) => place.id == elementID)?.
                    updateGroup({
                        x: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].x) + i * this.layerWidth, 
                        y: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].y) + j * this.nodeHeight
                    });
                
                this.diagram.transitions.find((transition) => transition.id == elementID)?.
                    updateGroup({
                        x: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].x) + i * this.layerWidth, 
                        y: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].y) + j * this.nodeHeight
                    });
            }
        }
    }

    //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    orderByBarycenter(nodeType: 'place' | 'transition') {
        const barycenters = this.calculateBarycenters(nodeType);
        for (const layer of this.layers) {
            if (nodeType == 'place') {
                const elementsOfType = layer.filter(element => element instanceof Place);
                elementsOfType.sort((a, b) => (barycenters.get(a.id) || 0) - (barycenters.get(b.id) || 0));
                const places = elementsOfType.map(element => element as unknown as Place);
                places.forEach((place, idx) => place.position = idx); // Update positions after sorting
            } else {
                const elementsOfType = layer.filter(element => element instanceof Transition);
                elementsOfType.sort((a, b) => (barycenters.get(a.id) || 0) - (barycenters.get(b.id) || 0));
                const transitions = elementsOfType.map(element => element as unknown as Transition);
                transitions.forEach((transition, idx) => transition.position = idx); // Update positions after sorting
            }
        }
    }

    calculateBarycenters(nodeType: 'place' | 'transition'): Map<string, number> {
        const barycenters = new Map<string, number>();
        if (nodeType == 'place') {
            let places = this.diagram.places.map((place) => place as Place);
            for (const element of places) {
                let neighbors = element.children.concat(element.parents);
                const neighborPositions = neighbors.map(neighbor => this.diagram.transitions.find((transition) => transition.id === neighbor.id)?.position || 0);
                
                const barycenter = neighborPositions.reduce((a, b) => a + b, 0) / neighborPositions.length;
                barycenters.set(element.id, isNaN(barycenter) ? element.position : barycenter);
            }
        } else {
            let transitions = this.diagram.transitions.map((transition) => transition as Transition);
            for (const element of transitions) {
                let neighbors = element.children.concat(element.parents);
                const neighborPositions = neighbors.map(neighbor => this.diagram.transitions.find((transition) => transition.id === neighbor.id)?.position || 0);
                
                const barycenter = neighborPositions.reduce((a, b) => a + b, 0) / neighborPositions.length;
                barycenters.set(element.id, isNaN(barycenter) ? element.position : barycenter);
            }
        }
        return barycenters;
    }

    private dfsRemove(element: Element, stack: Set<Element>, marked: Set<Element>) {
        //if element already visited, return and break recursive call
        if (marked.has(element))
            return;

        marked.add(element);
        stack.add(element);

        //fetch all outgoing lines from element
        let lines = this.diagram.lines.filter((line) => line.source.id == element.id);

        lines.forEach((line) => {
            if (stack.has(line.target as unknown as Element)) {
                //if element in stack, removeLine from diagram
                this.removedLines.push(line);
                this.diagram.lines.splice(this.diagram.lines.indexOf(line, 0), 1);
            } else if (!marked.has(line.target as unknown as Element)) {
                //if target of element was not already visited, recursive call
                this.dfsRemove(line.target as unknown as Element, stack, marked);
            }
        })
        stack.delete(element);
    }

    private getConnectedElements(elem: Element): Element[] {
        // This will hold the connected elements
        let connectedElements: Element[] = [];

        // Go through each line and check for connections
        this.diagram.lines.forEach(line => {
            // Check if the element is at the start of a line and add the end element
            if (line.source.id === elem.id) {
                connectedElements.push(line.target as unknown as Element);
            }
            // Check if the element is at the end of a line and add the start element
            else if (line.target.id === elem.id) {
                connectedElements.push(line.source as unknown as Element);
            }
        });

        return connectedElements;
    }

    // Helper function to order a layer by the barycenter heuristic
    orderLayerByBarycenter(currentLayer: Element[], adjacentLayer: Element[]): boolean {
        // Calculate barycenter for each element in the current layer
        let barycenters = currentLayer.map(elem => {
            let connectedElements = this.getConnectedElements(elem);
            if (connectedElements.length === 0) return 0;
            let averagePosition = connectedElements.reduce((acc, connectedElem) => acc + adjacentLayer.indexOf(connectedElem), 0) / connectedElements.length;
            return averagePosition;
        });

        // Create a list of elements with their barycenters and original indices
        let indexedBarycenters = barycenters.map((barycenter, index) => ({ barycenter, index }));

        // Sort by barycenter
        indexedBarycenters.sort((a, b) => a.barycenter - b.barycenter);

        // Reorder elements in the current layer according to sorted barycenters
        let newOrder = indexedBarycenters.map(bc => currentLayer[bc.index]);
        let hasChanged = !newOrder.every((elem, idx) => elem === currentLayer[idx]);

        // Update current layer order if there was a change
        if (hasChanged) {
            for (let i = 0; i < newOrder.length; i++) {
                currentLayer[i] = newOrder[i];
            }
        }
        return hasChanged;
    }
}