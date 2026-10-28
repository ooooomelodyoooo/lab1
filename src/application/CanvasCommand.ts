import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';

export class CanvasCommand extends Command {
  override get syntax(): string { return 'canvas [w] [h]'; }
  override execute(editor: Editor, args: Arguments): string {
    if (args.length === 0) return editor.document().canvas.describe();
    args.expect(2); return editor.resize(args.number(0, 'width'), args.number(1, 'height'));
  }
}
