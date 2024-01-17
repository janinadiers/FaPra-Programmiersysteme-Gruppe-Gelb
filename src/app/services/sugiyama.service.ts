import {Injectable} from '@angular/core';
import { Diagram } from 'src/app/classes/diagram/diagram';


@Injectable({
    providedIn: 'root',
})

export class SugiyamaService {
    diagram: Diagram = new Diagram([], []);
    layers: Element[][] = [];

    public begin(diagram: Diagram) {
        this.diagram = diagram;
        this.addLayers();
        this.reduceCrossings();
        this.pseudoLayers(); //TODO
        this.assignCoordinates();
    }

    // Step 1: BFS (Breadth-first search) for layer assignment
    addLayers() {
        this.layers = []; 
        let visited = new Set<Element>(); // To keep track of visited nodes
        let queue: Element[] = [];

        //Convert initialLayer of Place[] to Element[]
        //let initialLayer: Element[] = this.diagram.lines.filter((line) => line.target.id == 't1').map(line => line.source as unknown as Element); // Assumption that a Petrinet's first Transition is t1
        //let initialLayer: Element[] = this.diagram.places.filter((place) => place.id == this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].id).map(place => place as unknown as Element);  // Assumption that a Petrinet is starting with the lowest place.id
        let initialLayer: Element[] = this.diagram.places.filter((place) => place.parents.length == 0).map(place => place as unknown as Element); // Assumption that a Petrinet is starting with a place and does not have any parents

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
                    }
                }
            }

            if (currentLayer.length > 0) {
                this.layers.push(currentLayer); // Add new layer
            }

            queue = nextQueue; // Prepare next layer
        }
    }

    // Step 2: Reduce crossings using the barycenter heuristic - nN. for basic petrinet
    reduceCrossings() {
        let improved = true;
        let iterationCount = 0;
        const maxIterations = 100;

        while (improved && iterationCount < maxIterations) {
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

    // Step 3: Edge Routing
    pseudoLayers() {
        // Route edges as PolyLine 
    }

    // Step 4: Assign coordinates to each element
    assignCoordinates() {
        const layerWidth  = 200;
        const nodeHeight  = 100;

        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            for (let j = 0; j < layer.length; j++) {
                let elementID = layer[j].id;
                this.diagram.places.find((place) => place.id == elementID)?.
                    updateGroup(
                        {x: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].x) + i * layerWidth, 
                        y: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].y) + j * nodeHeight}
                    );
                
                this.diagram.transitions.find((transition) => transition.id == elementID)?.
                    updateGroup(
                        {x: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].x) + i * layerWidth, 
                        y: (this.diagram.places.sort((a,b) => a.id < b.id ? -1 : 1)[0].y) + j * nodeHeight}
                    );
            }
        }
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





















    // addLayers(diagram: Diagram) {
    //     const lines = diagram.lines;
    //     const places = diagram.places;
    //     const transitions = diagram.transitions;


    //     const element = [...places, ...transitions];
    //     element.sort((a,b) => a.id < b.id ? -1 : 1);






    //     places.sort((a,b) => a.id < b.id ? -1 : 1);
    //     transitions.sort((a,b) => a.id < b.id ? -1 : 1);


    //     places.forEach((place) => {
    //         const sourceLinePlaces = lines.filter((line) => line.source == place);
    //         place.layer++;
    //         // sourceLinePlaces.forEach((sourcePlace) => {
    //         //     sourcePlace.source.layer++;
    //         // });
    //     });
    //     transitions.forEach((transition) => {


    //     });








    //     lines.sort((a,b) => a.source.id < b.source.id ? -1 : 1);


    //     const sourceLinePlaces = lines.filter((line) => line.source.svgElement?.childNodes[0] instanceof SVGCircleElement);
    //     const sourceLineTransitions = lines.filter((line) => line.source.svgElement?.childNodes[0] instanceof SVGRectElement);






    //     return diagram;
    // }






    // removeBackwardEdges(diagram: Diagram) {
    //     // if (lines == undefined) 
    //     //     return;


    //     const lines = diagram.lines;
    //     lines.forEach( (line) => {
    //         const targetIsTransitions = lines.filter((line) => line.target.svgElement?.childNodes[0] instanceof SVGRectElement);
    //         targetIsTransitions.forEach( (targetIsTransition) => {
    //             const sourceIsPlace = lines.filter((line) => line.target.svgElement?.childNodes[0] instanceof SVGCircleElement);
    //             // if (targetIsTransition.target == )
    //         } )
    //     });
    //     return diagram;
    // }


}





