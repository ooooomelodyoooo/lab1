import type { Editor } from '../application/Editor.ts';
import { Lexer } from './Lexer.ts';
import { CommandRegistry } from './CommandRegistry.ts';

export class Cli {
  private readonly editor: Editor;
  private readonly lexer = new Lexer();
  private readonly commands = new CommandRegistry();
  constructor(editor: Editor) { this.editor = editor; }
  async executeLine(line: string): Promise<string> {
    try {
      const parsed = this.lexer.parse(line);
      return parsed ? await this.commands.execute(parsed.name, this.editor, parsed.args) : '';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `error: ${message.replace(/[\r\n]+/g, ' ')}`;
    }
  }
}
