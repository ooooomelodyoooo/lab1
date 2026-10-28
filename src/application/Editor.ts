import { SvgDocument } from '../domain/SvgDocument.ts';
import { Canvas } from '../domain/Canvas.ts';
import type { DocumentStore } from './DocumentStore.ts';
import type { EditCommand } from './EditCommand.ts';
import type { Arguments } from './Arguments.ts';
import { History } from './History.ts';

export class Editor {
  private current: SvgDocument | undefined;
  private path: string | undefined;
  private readonly history = new History();
  private readonly store: DocumentStore;
  constructor(store: DocumentStore) { this.store = store; }
  document(): SvgDocument {
    if (!this.current) throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  initialize(width = 800, height = 600): string {
    const document = new SvgDocument(new Canvas(width, height));
    this.current = document; this.path = undefined; this.history.barrier();
    return `canvas ${width}x${height} created`;
  }
  async read(path: string): Promise<string> {
    const loaded = await this.store.load(path);
    this.current = loaded.document; this.path = path; this.history.barrier();
    return [...loaded.warnings, `read ${path} (${this.current.all().length} elements)`].join('\n');
  }
  async save(path = this.path): Promise<string> {
    const document = this.document();
    if (!path) throw new Error("no file path. use 'save <file.svg>' first");
    await this.store.save(path, document);
    this.path = path; this.history.barrier();
    return `saved to ${path} (${document.all().length} elements)`;
  }
  resize(width: number, height: number): string {
    const document = this.document().clone(); document.canvas.resize(width, height);
    this.current = document; this.history.barrier(); return `canvas resized to ${width}x${height}`;
  }
  edit(command: EditCommand, args: Arguments): string {
    const next = command.perform(this.document(), args);
    this.current = next; this.history.record(command); return command.summary;
  }
  undo(): string {
    this.document(); const command = this.history.undo(); this.current = command.undo();
    return `undone: ${command.summary}`;
  }
  redo(): string {
    this.document(); const command = this.history.redo(); this.current = command.redo();
    return `redone: ${command.summary}`;
  }
}
