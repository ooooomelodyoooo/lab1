import type { Command } from '../application/Command.ts';
import type { CommandCatalog } from '../application/CommandCatalog.ts';
import type { Editor } from '../application/Editor.ts';
import type { Arguments } from '../application/Arguments.ts';
import { InitCommand } from '../application/InitCommand.ts';
import { ReadCommand } from '../application/ReadCommand.ts';
import { SaveCommand } from '../application/SaveCommand.ts';
import { CanvasCommand } from '../application/CanvasCommand.ts';
import { CreateCommand } from '../application/CreateCommand.ts';
import { DeleteCommand } from '../application/DeleteCommand.ts';
import { MoveCommand } from '../application/MoveCommand.ts';
import { ScaleCommand } from '../application/ScaleCommand.ts';
import { SetCommand } from '../application/SetCommand.ts';
import { GroupCommand } from '../application/GroupCommand.ts';
import { UngroupCommand } from '../application/UngroupCommand.ts';
import { AddToCommand } from '../application/AddToCommand.ts';
import { FrontCommand } from '../application/FrontCommand.ts';
import { BackCommand } from '../application/BackCommand.ts';
import { TreeCommand } from '../application/TreeCommand.ts';
import { ShowCommand } from '../application/ShowCommand.ts';
import { HelpCommand } from '../application/HelpCommand.ts';
import { UndoCommand } from '../application/UndoCommand.ts';
import { RedoCommand } from '../application/RedoCommand.ts';

/** Sole command-name dispatch point; always constructs a fresh undoable command. */
export class CommandRegistry implements CommandCatalog {
  private readonly types = new Map<string, new () => Command>([
    ['init', InitCommand],
    ['read', ReadCommand],
    ['save', SaveCommand],
    ['canvas', CanvasCommand],
    ['create', CreateCommand],
    ['delete', DeleteCommand],
    ['move', MoveCommand],
    ['scale', ScaleCommand],
    ['set', SetCommand],
    ['group', GroupCommand],
    ['ungroup', UngroupCommand],
    ['addto', AddToCommand],
    ['front', FrontCommand],
    ['back', BackCommand],
    ['tree', TreeCommand],
    ['show', ShowCommand],
    ['help', HelpCommand],
    ['undo', UndoCommand],
    ['redo', RedoCommand],
  ]);
  async execute(name: string, editor: Editor, args: Arguments): Promise<string> {
    const CommandType = this.types.get(name);
    if (!CommandType) throw new Error(`unknown command: ${name}`);
    return new CommandType().execute(editor, args, this);
  }
  help(): string {
    return [
      ...[...this.types.values()].map(Type => new Type().syntax),
      '', 'create parameters:',
      '  rect: x y width height [fill]', '  circle: cx cy r [fill]',
      '  ellipse: cx cy rx ry [fill]', '  line: x1 y1 x2 y2 [stroke]',
      '  text: x y "content"', '  g: (no parameters)',
      'set: fill | stroke | stroke-width | shape geometry | text (text only)',
      'Double-quote arguments with spaces. # at the beginning of a line is a comment.',
      'EOF (Ctrl-D) closes the REPL. IO commands reset and lock undo/redo until the next edit.',
    ].join('\n');
  }
}
