import { Validation } from './Validation.ts';

/** Geometry is encapsulated and validated even during transformations. */
export class NumericAttributes {
  private readonly values = new Map<string, number>();
  private readonly nonnegative: ReadonlySet<string>;
  constructor(keys: readonly string[], nonnegative: readonly string[]) {
    keys.forEach(key => this.values.set(key, 0));
    this.nonnegative = new Set(nonnegative);
  }
  get keys(): readonly string[] { return [...this.values.keys()]; }
  has(key: string): boolean { return this.values.has(key); }
  get(key: string): number {
    const value = this.values.get(key);
    if (value === undefined) throw new Error(`unknown attribute: ${key}`);
    return value;
  }
  set(key: string, value: string | number): void {
    if (!this.has(key)) throw new Error(`unknown attribute: ${key}`);
    this.values.set(key, this.nonnegative.has(key)
      ? Validation.nonnegative(value, key) : Validation.number(value, key));
  }
  entries(): readonly (readonly [string, number])[] { return [...this.values]; }
  move(keys: readonly string[], delta: number): void {
    keys.forEach(key => this.set(key, this.get(key) + delta));
  }
  scale(factor: number): void { this.keys.forEach(key => this.set(key, this.get(key) * factor)); }
}
