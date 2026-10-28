import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class SetCommand extends EditCommand {
  override get syntax(): string { return 'set <id> <attr> <value>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(3); const shape = document.find(args.at(0)); shape.set(args.at(1), args.at(2));
    return `${shape.label} updated: ${args.at(1)}=${JSON.stringify(args.at(2))}`;
  }
}
