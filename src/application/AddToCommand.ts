import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class AddToCommand extends EditCommand {
  override get syntax(): string { return 'addto <gid> <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2); const shape = document.find(args.at(1)); document.addTo(args.at(0), shape.id);
    return `${shape.label} moved into g#${args.at(0)}`;
  }
}
