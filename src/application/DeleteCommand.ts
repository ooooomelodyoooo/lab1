import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class DeleteCommand extends EditCommand {
  override get syntax(): string { return 'delete <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1); const shape = document.find(args.at(0)); document.delete(shape.id);
    return `${shape.label} deleted`;
  }
}
