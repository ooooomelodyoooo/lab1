import { LeafShape } from './LeafShape.ts';

export class Ellipse extends LeafShape {
  constructor(id: string) { super(id, ["cx", "cy", "rx", "ry"], ["rx", "ry"], ["cx"], ["cy"], 'fill'); }
  override get tag(): string { return 'ellipse'; }
  override describe(): string { return this.summary(`cx=${this.value('cx')} cy=${this.value('cy')} rx=${this.value('rx')} ry=${this.value('ry')}`); }
  override clone(): Ellipse { const copy = new Ellipse(this.id); this.copyTo(copy); return copy; }
}
