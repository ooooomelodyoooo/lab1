import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class BackCommand extends EditCommand {
  override get syntax(): string { return 'back <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1); const shape = document.find(args.at(0)); document.reorder(shape.id, false);
    return `${shape.label} moved to back`;
  }
}
