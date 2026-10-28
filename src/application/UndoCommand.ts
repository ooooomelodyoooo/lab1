import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';

export class UndoCommand extends Command {
  override get syntax(): string { return 'undo'; }
  override execute(editor: Editor, args: Arguments): string { args.expect(0); return editor.undo(); }
}
