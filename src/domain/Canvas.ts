import { Container } from './Container.ts';
import { Validation } from './Validation.ts';

export class Canvas extends Container {
  private w = 800;
  private h = 600;
  constructor(width = 800, height = 600) { super(''); this.resize(width, height); }
  override get tag(): string { return 'svg'; }
  override get label(): string { return 'svg'; }
  get width(): number { return this.w; }
  get height(): number { return this.h; }
  resize(width: number, height: number): void {
    const w = Validation.positive(width, 'width'); const h = Validation.positive(height, 'height');
    this.w = w; this.h = h;
  }
  override describe(): string { return `svg (${this.w}x${this.h})`; }
  override clone(): Canvas {
    const copy = new Canvas(this.w, this.h); this.copyChildrenTo(copy); return copy;
  }
}
