export class State {

    private _iteration: number;
    private _id: number;
    private _state: Map<string, number>;
    private _parents: Array<State>;
    private _children: Array<State>;
    private _svgCircle: SVGElement | undefined;
    private _x: number;
    private _y: number;
    private _activeTransition: string | undefined;
    
    constructor(iteration: number, id: number, state: Map<string, number>) {
      this._iteration = iteration;
      this._id = id;
      this._state = state;
      this._parents = [];
      this._children = [];
      this._x = 0;
      this._y = 0;
    }
  
    get iteration(): number {
        return this._iteration;
    }

    get id(): number {
        return this._id;
    }

    get state(): Map<string, number> {
        return this._state;
    }

    set children(object: State) {
        this._children.push(object);
    }

    get children(): Array<State> {
        return this._children;
    }

    set parents(object: State) {
        this._parents.push(object);
    }

    get parents(): Array<State> {
        return this._parents;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;

    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;

    }

    set activeTransition(value: string) {
        this._activeTransition = value;

    }

    drawState() {
        const svgElement = document.getElementById('canvas');
    
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    
        circle.setAttribute('id', this._iteration.toString() + this._id.toString());
        circle.setAttribute('cx', this._x.toString()); 
        circle.setAttribute('cy', this._y.toString()); 
        circle.setAttribute('r', '18');
        circle.setAttribute('fill', 'black');
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', '2');
        svgElement?.appendChild(circle);
    
        this._svgCircle = circle;
    
        if (this._parents !== undefined && this._parents.length > 0) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this._parents[0].x.toString());
            line.setAttribute('y1', this._parents[0].y.toString());
            line.setAttribute('x2', this._x.toString());
            line.setAttribute('y2', this._y.toString());
            line.setAttribute('stroke', 'red');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('fill', 'transparent');
            if (svgElement) {
                if (svgElement.firstChild) {
                    svgElement.insertBefore(line, svgElement.firstChild);
                }
                // Add text to the line
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', ((this._parents[0].x + this._x) / 2).toString());
            text.setAttribute('y', ((this._parents[0].y + this._y) / 2).toString());
            text.setAttribute('fill', 'black');
            text.setAttribute('font-size', '15');
            text.textContent = this._activeTransition!;

            svgElement?.appendChild(text);

            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', `arrowhead-${this._id}`);
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '28');
            marker.setAttribute('refY', '5');
            marker.setAttribute('orient', 'auto-start-reverse');
            marker.setAttribute('markerUnits', 'strokeWidth');
    
            
            const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrowhead.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
            arrowhead.setAttribute('fill', 'red');
    
            marker.appendChild(arrowhead);
            svgElement?.appendChild(marker); 
            
            const markerId = `url(#arrowhead-${this._id})`;
            line.setAttribute('marker-end', markerId);
        }
    }

}


}

