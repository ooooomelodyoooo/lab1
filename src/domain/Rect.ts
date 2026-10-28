import { LeafShape } from './LeafShape.ts';

export class Rect extends LeafShape {
  constructor(id: string) { super(id, ["x", "y", "width", "height"], ["width", "height"], ["x"], ["y"], 'fill'); }
  override get tag(): string { return 'rect'; }
  override describe(): string { return this.summary(`x=${this.value('x')} y=${this.value('y')} w=${this.value('width')} h=${this.value('height')}`); }
  override clone(): Rect { const copy = new Rect(this.id); this.copyTo(copy); return copy; }
}
