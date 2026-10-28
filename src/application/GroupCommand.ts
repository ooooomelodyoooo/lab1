import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class GroupCommand extends EditCommand {
  override get syntax(): string { return 'group <newGid> <id1> <id2>…'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2, Number.MAX_SAFE_INTEGER); const members = args.all().slice(1);
    const group = document.group(args.at(0), members); return `${group.label} created with ${members.length} children`;
  }
}
