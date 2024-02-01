

export class IntermediatePoint {
    private _x: number;
    private _y: number;
    private _isVirtual: boolean;
    private _circle: SVGCircleElement | undefined = undefined;

    constructor(x:number, y: number, isVirtual: boolean) {
        this._x = x;
        this._y = y;
        this._isVirtual = isVirtual;
        // this.createCircle();
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get isVirtual(): boolean {
        return this._isVirtual;
    }

    set isVirtual(value: boolean) {
        this._isVirtual = value;
    }

    get svg (): SVGCircleElement | undefined {
        return this._circle;
    }


    createCircle(){
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', this.x.toString());
        circle.setAttribute('cy', this.y.toString());
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'transparent');
        circle.style.cursor = 'move';
        this._circle = circle;
    }

    public remove(): void {
        if(this._circle) {
            this._circle.remove();
        }
    }

    public update(x:number, y:number): void {
        this._x = x;
        this._y = y;
        if(this._circle) {
            this._circle.setAttribute('cx', this.x.toString());
            this._circle.setAttribute('cy', this.y.toString());
        }
    }

    
    
    
}