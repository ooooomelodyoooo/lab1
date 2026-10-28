import { SvgShape } from './SvgShape.ts';
import { NumericAttributes } from './NumericAttributes.ts';
import { Validation } from './Validation.ts';

export abstract class LeafShape extends SvgShape {
  protected readonly geometry: NumericAttributes;
  private readonly horizontal: readonly string[];
  private readonly vertical: readonly string[];
  private readonly paint: string;
  constructor(id: string, keys: readonly string[], nonnegative: readonly string[],
    horizontal: readonly string[], vertical: readonly string[],
    paint = 'fill') {
    super(id);
    this.horizontal = horizontal; this.vertical = vertical; this.paint = paint;
    this.geometry = new NumericAttributes(keys, nonnegative);
  }
  override configure(args: readonly string[]): void {
    Validation.count(args, this.geometry.keys.length, this.geometry.keys.length + 1);
    this.geometry.keys.forEach((key, index) => this.geometry.set(key, args[index]!));
    if (args.length > this.geometry.keys.length) this.set(this.paint, args.at(-1)!);
  }
  override move(dx: number, dy: number): void {
    this.geometry.move(this.horizontal, dx);
    this.geometry.move(this.vertical, dy);
  }
  override scale(factor: number): void { this.geometry.scale(Validation.positive(factor, 'scale factor')); }
  override set(attribute: string, value: string): void {
    if (this.geometry.has(attribute)) this.geometry.set(attribute, value);
    else super.set(attribute, value);
  }
  override attributes(): ReadonlyMap<string, string> {
    return new Map([...super.attributes(), ...this.geometry.entries().map(([key, value]) => [key, String(value)] as const)]);
  }
  override importAttributes(attributes: ReadonlyMap<string, string>, content: string): void {
    const presentation = new Map(attributes);
    for (const key of this.geometry.keys) {
      if (attributes.has(key)) this.geometry.set(key, attributes.get(key)!);
      presentation.delete(key);
    }
    super.importAttributes(presentation, content);
  }
  protected value(key: string): number { return this.geometry.get(key); }
  protected summary(geometry: string): string {
    return `${this.label} ${geometry}${this.paintSummary() ? ` ${this.paintSummary()}` : ''}`;
  }
  protected copyTo(target: LeafShape): void {
    this.geometry.entries().forEach(([key, value]) => target.geometry.set(key, value));
    this.copyPresentation(target);
  }
}
