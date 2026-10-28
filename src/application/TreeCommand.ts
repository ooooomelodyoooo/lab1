import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';
import { TreeRenderer } from './TreeRenderer.ts';

export class TreeCommand extends Command {
  override get syntax(): string { return 'tree [id]'; }
  override execute(editor: Editor, args: Arguments): string {
    args.expect(0, 1); const doc = editor.document();
    return new TreeRenderer().render(args.length ? doc.find(args.at(0)) : doc.canvas);
  }
}
