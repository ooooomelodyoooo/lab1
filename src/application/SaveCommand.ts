import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';

export class SaveCommand extends Command {
  override get syntax(): string { return 'save [file.svg]'; }
  override execute(editor: Editor, args: Arguments): Promise<string> { args.expect(0, 1); return editor.save(args.length ? args.at(0) : undefined); }
}
