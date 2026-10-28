/** Shared domain validation; no IO and no runtime type-name dispatch. */
export class Validation {
  static number(value: string | number, name: string): number {
    if (typeof value === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) {
      throw new Error(`invalid number for ${name}: ${value}`);
    }
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`invalid number for ${name}: ${value}`);
    return Object.is(number, -0) ? 0 : number;
  }
  static nonnegative(value: string | number, name: string): number {
    const number = this.number(value, name);
    if (number < 0) throw new Error(`${name} must be non-negative`);
    return number;
  }
  static positive(value: string | number, name: string): number {
    const number = this.number(value, name);
    if (number <= 0) throw new Error(`${name} must be positive`);
    return number;
  }
  static id(id: string): void {
    if (!id || /[\s\u0000-\u001f]/u.test(id)) throw new Error(`invalid id: ${id}`);
  }
  static count(args: readonly unknown[], min: number, max = min): void {
    if (args.length < min || args.length > max) throw new Error('invalid arguments; use help for syntax');
  }
  static text(value: string): string {
    for (const char of value) {
      const cp = char.codePointAt(0)!;
      if (!(cp === 9 || cp === 10 || cp === 13 || (cp >= 32 && cp <= 0xd7ff) ||
          (cp >= 0xe000 && cp <= 0xfffd) || (cp >= 0x10000 && cp <= 0x10ffff))) {
        throw new Error('invalid XML character');
      }
    }
    return value;
  }
}
