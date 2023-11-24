
export class Element {
    private readonly _id: string;
    private _x: number;
    private _y: number;
    private _svgElement: SVGElement | undefined;
    private isDragging = false;
    

    constructor(id: string, x?: number , y?: number) {
        this._id = id;
        this._x = x ?? 0;
        this._y = y ?? 0;
    }

    get id(): string {
        return this._id;
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

    get svgElement(): SVGElement | undefined {
        return this._svgElement;
    }

    set svgElement(svgElement: SVGElement) {
        this._svgElement = svgElement;
    }



    public registerSvg(svg: SVGElement) {
        
        this._svgElement = svg;
        this._svgElement.onmousedown = (event) => {
            this.processMouseDown(event);
        };
        this._svgElement.onmouseup = (event) => {
            this.processMouseUp(event);
        };
        this._svgElement.onmousemove = (event) => {
            this.processMouseMove(event);
        }
    }

    private processMouseDown(event: MouseEvent) {
        console.log('Mouse down');
        
        if (this._svgElement === undefined) {
            return;
        }
        this.isDragging = true;
        //this._svgElement.setAttribute('fill', 'red');
    }

    private processMouseUp(event: MouseEvent) {
        if (this._svgElement === undefined) {
            return;
        }
        console.log('Mouse up');
        
        //this._svgElement.setAttribute('fill', 'black');
        if (this.isDragging) {
            this.isDragging = false;
          
            
            console.log('Stopped dragging');
        }
    }

    private processMouseMove(event: MouseEvent) {
        if (this._svgElement === undefined) {
            return;
        }

        const svgElement = document.getElementById('canvas');
        const svgContainer = svgElement?.getBoundingClientRect();
        // Berechnung der Maus Koordinanten relativ zum SVG Element
        const mouseX = event.clientX - svgContainer!.left;
        const mouseY = event.clientY - svgContainer!.top;
        if (this.isDragging) {
            // Your logic to handle dragging
            console.log('Element is being dragged');
            
            this.x = mouseX;
            this.y = mouseY;
            
            if(this.svgElement && this.svgElement instanceof SVGCircleElement){
                this.svgElement.setAttribute('cx', this.x.toString());
                this.svgElement.setAttribute('cy', this.y.toString());
            }
            else if(this.svgElement && this.svgElement instanceof SVGRectElement){
                this.svgElement.setAttribute('x', this.x.toString());
                this.svgElement.setAttribute('y', this.y.toString());
            }
            
            
           
        }
    }

    public createSVG(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }


}
