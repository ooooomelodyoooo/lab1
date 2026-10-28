import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';
import type { CommandCatalog } from './CommandCatalog.ts';

export abstract class Command {
  abstract get syntax(): string;
  abstract execute(editor: Editor, args: Arguments, catalog: CommandCatalog): string | Promise<string>;
}
