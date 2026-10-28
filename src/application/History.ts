import type { EditCommand } from './EditCommand.ts';

export class History {
  private readonly past: EditCommand[] = [];
  private readonly future: EditCommand[] = [];
  private locked = true;
  barrier(): void { this.past.length = 0; this.future.length = 0; this.locked = true; }
  record(command: EditCommand): void {
    this.past.push(command); this.future.length = 0; this.locked = false;
  }
  undo(): EditCommand {
    if (this.locked) throw new Error('undo not allowed after io command');
    const command = this.past.pop();
    if (!command) throw new Error('nothing to undo');
    this.future.push(command); return command;
  }
  redo(): EditCommand {
    if (this.locked) throw new Error('undo not allowed after io command');
    const command = this.future.pop();
    if (!command) throw new Error('nothing to redo');
    this.past.push(command); return command;
  }
}
