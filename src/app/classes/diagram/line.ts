import { Element } from 'src/app/classes/diagram/element';

export class Line extends Element {

private _x2: number;
private _y2: number;

constructor(id: string) {
    super(id);
    this._x2 = 0;
    this._y2 = 0;
  }

  get x2(): number {
    return this._x2;
  }

  set x2(value: number) {
    this._x2 = value;
  }

  get y2(): number {
    return this._y2;
  }

  set y2(value: number) {
    this._y2 = value;
  }


}
