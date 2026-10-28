import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';
import type { CommandCatalog } from './CommandCatalog.ts';

export class HelpCommand extends Command {
  override get syntax(): string { return 'help'; }
  override execute(_editor: Editor, args: Arguments, catalog: CommandCatalog): string {
    args.expect(0); return catalog.help();
  }
}
