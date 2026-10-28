import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';
import { TreeRenderer } from './TreeRenderer.ts';

export class ShowCommand extends Command {
  override get syntax(): string { return 'show <id>'; }
  override execute(editor: Editor, args: Arguments): string {
    args.expect(1); return new TreeRenderer().show(editor.document().find(args.at(0)));
  }
}
