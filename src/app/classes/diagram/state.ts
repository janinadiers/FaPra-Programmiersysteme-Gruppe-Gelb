export class State {

    private _iteration: number;
    private _id: number;
    private _state: Map<string, number>;
    private _parents: Array<State>;
    private _children: Array<State>;
    private _svgCircle: SVGElement | undefined;
    private _x: number;
    private _y: number;
    
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

    drawState(){

        const svgElement = document.getElementById('canvas');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        circle.setAttribute('id', this._iteration.toString() + this._id.toString());
        circle.setAttribute('cx', this._x.toString()); // x-coordinate of the center
        circle.setAttribute('cy', this._y.toString()); // y-coordinate of the center
        circle.setAttribute('r', "18");
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', '2');
        svgElement?.appendChild(circle);

        this._svgCircle = circle;
    }

    drawTransition(source: State, target: State){



    }
}




