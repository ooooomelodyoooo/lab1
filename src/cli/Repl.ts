import { createInterface } from 'node:readline';
import process from 'node:process';
import type { Cli } from './Cli.ts';

export class Repl {
  private readonly cli: Cli;
  constructor(cli: Cli) { this.cli = cli; }
  async run(): Promise<void> {
    const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    const lines = createInterface({ input: process.stdin, output: process.stdout, terminal: interactive });
    process.stdout.write("svg-editor 0.1 — type 'help' for commands\n");
    process.stdout.write('svg> ');
    let failed = false;
    for await (const line of lines) {
      const result = await this.cli.executeLine(line);
      if (result) process.stdout.write(`${result}\n`);
      failed ||= result.startsWith('error:');
      process.stdout.write('svg> ');
    }
    process.stdout.write('\n');
    if (!interactive && failed) process.exitCode = 1;
  }
}
