import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

export class UngroupCommand extends EditCommand {
  override get syntax(): string { return 'ungroup <gid>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1); const group = document.find(args.at(0)); const count = group.children.length;
    document.ungroup(group.id); return `${group.label} ungrouped (${count} children promoted)`;
  }
}
