import type { Arguments } from '../application/Arguments.ts';

export class ParsedLine {
  private readonly command: string;
  private readonly arguments: Arguments;
  constructor(name: string, args: Arguments) { this.command = name; this.arguments = args; }
  get name(): string { return this.command; }
  get args(): Arguments { return this.arguments; }
}
