import { Command } from './Command.ts';
import type { Editor } from './Editor.ts';
import type { Arguments } from './Arguments.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';

/** A fresh concrete command owns each undo unit and its immutable-in-practice snapshots. */
export abstract class EditCommand extends Command {
  private before: SvgDocument | undefined;
  private after: SvgDocument | undefined;
  private feedback = '';
  override execute(editor: Editor, args: Arguments): string { return editor.edit(this, args); }
  perform(current: SvgDocument, args: Arguments): SvgDocument {
    const working = current.clone();
    const feedback = this.apply(working, args); // Throws before anything is published.
    this.before = current.clone(); this.after = working.clone(); this.feedback = feedback;
    return working;
  }
  get summary(): string { return this.feedback; }
  undo(): SvgDocument {
    if (!this.before) throw new Error('command has not executed');
    return this.before.clone();
  }
  redo(): SvgDocument {
    if (!this.after) throw new Error('command has not executed');
    return this.after.clone();
  }
  protected abstract apply(document: SvgDocument, args: Arguments): string;
}
