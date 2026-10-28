import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';
import { ShapeFactory } from '../domain/ShapeFactory.ts';

export class CreateCommand extends EditCommand {
  override get syntax(): string { return 'create <rect|circle|ellipse|line|text|g> <id> [params…] [in <containerId>]'; }
  protected override apply(document: SvgDocument, input: Arguments): string {
    const args = input.creation(); args.expect(2, Number.MAX_SAFE_INTEGER);
    const id = args.at(1);
    if (document.has(id)) throw new Error(`id already exists: ${id}`);
    const shape = new ShapeFactory().create(args.at(0), id, args.all().slice(2));
    const parent = document.container(input.parentId); document.add(shape, parent);
    return `${shape.label} created${input.parentId === undefined ? '' : ` in ${parent.label}`}`;
  }
}
