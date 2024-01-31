export class State {

    private _iteration: number;
    private _id: number;
    private _state: Map<string, number>;
    private _parents: Array<State>;
    private _svgCircle: SVGElement | undefined;
    private _x: number;
    private _y: number;
    private _firedTransitions: string[] = [];
    private _level: number = 0;
    
    constructor(iteration: number, id: number, state: Map<string, number>) {
      this._iteration = iteration;
      this._id = id;
      this._state = state;
      this._parents = [];
      this._firedTransitions = [];
      this._x = 0;
      this._y = 0;
      this._svgCircle = undefined;
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

    set firedTransitions(value: string) {
        this._firedTransitions.push(value);
    }

    get firedTransitions(): string[]{
        return this._firedTransitions;

    }

    set level (value: number){
        this._level = value;
    }

    get level(): number {

        return this._level;
    }

    set svgCircle(circle :SVGElement){
        this._svgCircle = circle;
    }

    transferParents(array: Array<State>) {

        this._parents = array;
    }
    
    drawState() {
        const svgElement = document.getElementById('canvas');
    
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    
        circle.setAttribute('id', this._iteration.toString() + this._id.toString());
        circle.setAttribute('cx', this._x.toString()); 
        circle.setAttribute('cy', this._y.toString()); 
        circle.setAttribute('r', '10');
        circle.setAttribute('fill', 'black');
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', '2');     
        svgElement?.appendChild(circle);
        
        this._svgCircle = circle;
    
        this.drawTransition()
    }

    updateState() {
        
        if(!this._svgCircle) return;
       
        let lines = document.querySelectorAll('line');
        for(let line of Array.from(lines)){
            if(line.getAttribute('x1') === this._svgCircle?.getAttribute('cx') && line.getAttribute('y1') === this._svgCircle?.getAttribute('cy')){
                line.setAttribute('x1', this.x.toString());
                line.setAttribute('y1', this.y.toString());
            }
            else if(line.getAttribute('x2') === this._svgCircle?.getAttribute('cx') && line.getAttribute('y2') === this._svgCircle?.getAttribute('cy')){
                line.setAttribute('x2', this.x.toString());
                line.setAttribute('y2', this.y.toString());
            }
        }

       
        for (let i = 0; i < this._parents.length; i++){
            // verschieben des Texts
            let texts = document.querySelectorAll('text');
            for(let text of Array.from(texts)){
               
                if((text.getAttribute('id') === this._id.toString() + this._parents[i].id.toString())){
                    let parentX = this._parents[i].x
                    let parentY = this._parents[i].y
                    let x = this._svgCircle?.getAttribute('cx') || '';
                    let y = this._svgCircle?.getAttribute('cy') || '';

                    text.setAttribute('x',(( (parentX + ((parentX + parseInt(x)) / 2)) /2 ).toString()));
                    text.setAttribute('y',(( (parentY + ((parentY + parseInt(y)) / 2)) /2  ).toString()));
                }
            }

            //verschieben des Hintergrundkreises
            let circles = document.querySelectorAll('circle');
            for(let circle of Array.from(circles)){
                if((circle.getAttribute('id') === this._id.toString() + this._parents[i].id.toString())){
                    let parentX = this._parents[i].x
                    let parentY = this._parents[i].y
                    let x = this._svgCircle?.getAttribute('cx') || '';
                    let y = this._svgCircle?.getAttribute('cy') || '';

                    circle.setAttribute('cx',(( (parentX + ((parentX + parseInt(x)) / 2)) /2 ).toString()));
                    circle.setAttribute('cy',(( (parentY + ((parentY + parseInt(y)) / 2)) /2  ).toString()));
                }
            }
        }

         this._svgCircle?.setAttribute('cx', this.x.toString());
         this._svgCircle?.setAttribute('cy', this.y.toString());

         
        
    }


    drawTransition(){

        const svgElement = document.getElementById('canvas');

        if (this._parents !== undefined && this._parents.length > 0) {
                
            for (let i = 0; i < this._parents.length; i++){
                // line
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', this._parents[i].x.toString());
                line.setAttribute('y1', this._parents[i].y.toString());
                line.setAttribute('x2', this._x.toString());
                line.setAttribute('y2', this._y.toString());
                line.setAttribute('stroke', 'red');
                line.setAttribute('stroke-width', '1');
                line.setAttribute('fill', 'transparent');
                if (svgElement) {
                    if (svgElement.firstChild) {
                        svgElement.insertBefore(line, svgElement.firstChild);
                    }
                }
                const uuid = this._id.toString() + this._parents[i].id.toString();

                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('id', uuid);

                // background circle
                const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                backgroundCircle.setAttribute('id', uuid);
                backgroundCircle.setAttribute('cx',(( ((this._parents[i].x) + ((this._parents[i].x + this._x) / 2)) /2 ).toString()));
                backgroundCircle.setAttribute('cy', (( ((this._parents[i].y) + ((this._parents[i].y + this._y) / 2)) /2  ).toString()));
                backgroundCircle.setAttribute('r', '5');
                backgroundCircle.setAttribute('fill', 'white');
               group.appendChild(backgroundCircle);                //svgElement?.appendChild(backgroundCircle);
                // text
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('id', uuid);
                text.setAttribute('x',(( ((this._parents[i].x) + ((this._parents[i].x + this._x) / 2)) /2 ).toString()));
                text.setAttribute('y',(( ((this._parents[i].y) + ((this._parents[i].y + this._y) / 2)) /2  ).toString()));
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dy', '.3em');
                text.setAttribute('font-size', '14px');
                text.setAttribute('font-weight', 'bold'); 
                let id = this._firedTransitions[i];
                text.textContent = id;                
                group.appendChild(text);                //svgElement?.appendChild(text);

                // marker
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', `arrowhead-${this._id}`);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '10');
                marker.setAttribute('refX', '20');
                marker.setAttribute('refY', '5');
                marker.setAttribute('orient', 'auto-start-reverse');
                marker.setAttribute('markerUnits', 'strokeWidth');

                //arrowhead
                const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                arrowhead.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
                arrowhead.setAttribute('fill', 'red');
        
                marker.appendChild(arrowhead);
                svgElement?.appendChild(marker); 
                group.appendChild(marker);
                svgElement?.appendChild(group); 
                
                const markerId = `url(#arrowhead-${this._id})`;
                line.setAttribute('marker-end', markerId);

            }
        }
    }
}
    



