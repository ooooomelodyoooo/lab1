import { LeafShape } from './LeafShape.ts';

export class Line extends LeafShape {
  constructor(id: string) { super(id, ["x1", "y1", "x2", "y2"], [], ["x1", "x2"], ["y1", "y2"], 'stroke'); }
  override get tag(): string { return 'line'; }
  override describe(): string { return this.summary(`(${this.value('x1')},${this.value('y1')}) -> (${this.value('x2')},${this.value('y2')})`); }
  override clone(): Line { const copy = new Line(this.id); this.copyTo(copy); return copy; }
}
