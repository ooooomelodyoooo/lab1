import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';

export class RedoCommand extends Command {
  override get syntax(): string { return 'redo'; }
  override execute(editor: Editor, args: Arguments): string { args.expect(0); return editor.redo(); }
}
