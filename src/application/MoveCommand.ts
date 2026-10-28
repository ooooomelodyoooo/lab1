import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class MoveCommand extends EditCommand {
  override get syntax(): string { return 'move <id> <dx> <dy>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(3); const shape = document.find(args.at(0));
    const dx = args.number(1, 'dx'), dy = args.number(2, 'dy'); shape.move(dx, dy);
    return `${shape.label} moved by (${dx},${dy})`;
  }
}
