import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';

export class InitCommand extends Command {
  override get syntax(): string { return 'init [w] [h]'; }
  override execute(editor: Editor, args: Arguments): string {
    args.expect(0, 2); return editor.initialize(args.length >= 1 ? args.number(0, 'width') : 800, args.length >= 2 ? args.number(1, 'height') : 600);
  }
}
