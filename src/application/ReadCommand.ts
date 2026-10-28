import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';

export class ReadCommand extends Command {
  override get syntax(): string { return 'read <file.svg>'; }
  override execute(editor: Editor, args: Arguments): Promise<string> { args.expect(1); return editor.read(args.at(0)); }
}
