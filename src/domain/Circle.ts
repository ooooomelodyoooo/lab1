import { LeafShape } from './LeafShape.ts';

export class Circle extends LeafShape {
  constructor(id: string) { super(id, ["cx", "cy", "r"], ["r"], ["cx"], ["cy"], 'fill'); }
  override get tag(): string { return 'circle'; }
  override describe(): string { return this.summary(`cx=${this.value('cx')} cy=${this.value('cy')} r=${this.value('r')}`); }
  override clone(): Circle { const copy = new Circle(this.id); this.copyTo(copy); return copy; }
}
