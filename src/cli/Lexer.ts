import { Arguments } from '../application/Arguments.ts';
import { ParsedLine } from './ParsedLine.ts';

export class Lexer {
  parse(line: string): ParsedLine | undefined {
    if (!line.trim() || line.trimStart().startsWith('#')) return undefined;
    const values: string[] = [], quoted: boolean[] = [];
    let index = 0;
    while (index < line.length) {
      if (/\s/u.test(line[index]!)) { index++; continue; }
      let value = '';
      const quote = line[index] === '"';
      if (quote) {
        index++; let closed = false;
        while (index < line.length) {
          const char = line[index++]!;
          if (char === '"') { closed = true; break; }
          if (char === String.fromCharCode(92)) {
            if (index === line.length) throw new Error('unterminated escape in quoted argument');
            const next = line[index++]!;
            if (next === 'n') value += '\n';
            else if (next === 'r') value += '\r';
            else if (next === 't') value += '\t';
            else if (next === '"' || next === String.fromCharCode(92)) value += next;
            else throw new Error(`unsupported escape: \${next}`);
          } else value += char;
        }
        if (!closed) throw new Error('unterminated quoted argument');
        if (index < line.length && !/\s/u.test(line[index]!)) throw new Error('expected space after quoted argument');
      } else {
        while (index < line.length && !/\s/u.test(line[index]!)) {
          if (line[index] === '"') throw new Error('quote must start an argument');
          value += line[index++]!;
        }
      }
      values.push(value); quoted.push(quote);
    }
    return new ParsedLine(values[0]!, new Arguments(values.slice(1), quoted.slice(1)));
  }
}
