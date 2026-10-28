import { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';
import { Validation } from '../domain/Validation.ts';

export class ScaleCommand extends EditCommand {
  override get syntax(): string { return 'scale <id> <factor>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2); const shape = document.find(args.at(0));
    const factor = Validation.number(args.at(1), 'scale factor');
    if (factor <= 0) throw new Error('scale factor must be positive');
    shape.scale(factor); return `${shape.label} scaled by ${factor}`;
  }
}
