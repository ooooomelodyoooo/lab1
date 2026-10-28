import { LeafShape } from './LeafShape.ts';
import { Validation } from './Validation.ts';

export class Text extends LeafShape {
  private text = '';
  constructor(id: string) { super(id, ['x', 'y'], [], ['x'], ['y']); }
  override get tag(): string { return 'text'; }
  override get content(): string { return this.text; }
  override configure(args: readonly string[]): void {
    Validation.count(args, 3);
    this.set('x', args[0]!); this.set('y', args[1]!); this.set('text', args[2]!);
  }
  override set(attribute: string, value: string): void {
    if (attribute === 'text') this.text = Validation.text(value);
    else super.set(attribute, value);
  }
  override importAttributes(attributes: ReadonlyMap<string, string>, content: string): void {
    super.importAttributes(attributes, '');
    this.set('text', content);
  }
  override normalizeTransform(factor: number, dx: number, dy: number): void {
    if (factor !== 1) {
      const size = this.presentation('font-size', '16').replace(/px$/u, '');
      this.importPresentation('font-size', String(Validation.nonnegative(size, 'font-size') * factor));
    }
    super.normalizeTransform(factor, dx, dy);
  }
  override describe(): string { return this.summary(`(${this.value('x')},${this.value('y')}) ${JSON.stringify(this.text)}`); }
  override clone(): Text {
    const copy = new Text(this.id); this.copyTo(copy); copy.text = this.text; return copy;
  }
}
