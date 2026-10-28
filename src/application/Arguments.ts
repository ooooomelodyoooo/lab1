import { Validation } from '../domain/Validation.ts';

export class Arguments {
  private readonly values: readonly string[];
  private readonly quoted: readonly boolean[];
  constructor(values: readonly string[], quoted: readonly boolean[] = []) {
    this.values = [...values]; this.quoted = [...quoted];
  }
  get length(): number { return this.values.length; }
  all(): readonly string[] { return [...this.values]; }
  at(index: number): string {
    const value = this.values[index];
    if (value === undefined) throw new Error('invalid arguments; use help for syntax');
    return value;
  }
  expect(min: number, max = min): void { Validation.count(this.values, min, max); }
  number(index: number, name: string): number { return Validation.number(this.at(index), name); }
  get parentId(): string | undefined {
    const index = this.values.length - 2;
    return index >= 0 && this.values[index] === 'in' && !this.quoted[index] ? this.values[index + 1] : undefined;
  }
  creation(): Arguments {
    return this.parentId === undefined ? this : new Arguments(this.values.slice(0, -2), this.quoted.slice(0, -2));
  }
}
