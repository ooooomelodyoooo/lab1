import type { Container } from './Container.ts';
import { Validation } from './Validation.ts';

export abstract class SvgShape {
  private owner: Container | undefined;
  private readonly styles = new Map<string, string>();
  private readonly extra = new Map<string, string>();
  private static readonly styleKeys = new Set(['fill', 'stroke', 'stroke-width']);
  // Presentation attributes preserved on import; editing still uses the assignment's whitelist.
  private static readonly preservedKeys = new Set([
    'font-size', 'font-family', 'font-weight', 'text-anchor', 'dominant-baseline',
    'data-kind',
  ]);
  private readonly identifier: string;
  constructor(identifier: string) { Validation.text(identifier); this.identifier = identifier; }
  abstract get tag(): string;
  get id(): string { return this.identifier; }
  get label(): string { return `${this.tag}#${this.id}`; }
  get parent(): Container | undefined { return this.owner; }
  get children(): readonly SvgShape[] { return []; }
  get content(): string | undefined { return undefined; }
  attachTo(parent: Container | undefined): void { this.owner = parent; }
  contains(other: SvgShape): boolean { return this === other; }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  normalizeTransform(factor: number, dx: number, dy: number): void {
    this.scale(factor); this.move(dx, dy);
  }
  abstract clone(): SvgShape;
  abstract describe(): string;
  abstract configure(args: readonly string[]): void;
  attributes(): ReadonlyMap<string, string> {
    return new Map([['id', this.id], ...this.extra, ...this.styles]);
  }
  set(attribute: string, value: string): void {
    if (!SvgShape.styleKeys.has(attribute)) throw new Error(`unknown attribute: ${attribute}`);
    Validation.text(value);
    if (attribute === 'stroke-width') value = String(Validation.nonnegative(value, attribute));
    if (!value) throw new Error(`invalid value for ${attribute}`);
    this.styles.set(attribute, value);
  }
  importAttributes(attributes: ReadonlyMap<string, string>, content: string): void {
    for (const [key, value] of attributes) {
      if (key === 'id' || key === 'transform') continue;
      if (SvgShape.styleKeys.has(key)) this.set(key, value);
      else if (SvgShape.preservedKeys.has(key) || key.startsWith('data-')) {
        this.extra.set(key, Validation.text(value));
      } else throw new Error(`unsupported SVG attribute: ${key}`);
    }
    if (content.trim()) throw new Error(`unexpected text in <${this.tag}>`);
  }
  protected copyPresentation(target: SvgShape): void {
    for (const [key, value] of this.styles) target.styles.set(key, value);
    for (const [key, value] of this.extra) target.extra.set(key, value);
  }
  inheritPresentation(source: SvgShape): void {
    const own = this.attributes();
    for (const [key, value] of source.attributes()) {
      if (!own.has(key) && (SvgShape.styleKeys.has(key) ||
          (SvgShape.preservedKeys.has(key) && key !== 'data-kind'))) this.importPresentation(key, value);
    }
  }
  protected presentation(key: string, fallback: string): string {
    return this.attributes().get(key) ?? this.parent?.presentation(key, fallback) ?? fallback;
  }
  protected importPresentation(key: string, value: string): void {
    if (SvgShape.styleKeys.has(key)) this.set(key, value);
    else this.extra.set(key, Validation.text(value));
  }
  protected paintSummary(): string {
    return [...this.styles].map(([key, value]) => `${key}=${value}`).join(' ');
  }
}
