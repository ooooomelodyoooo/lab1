import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '../src/application/Editor.ts';
import { Arguments } from '../src/application/Arguments.ts';
import { CreateCommand } from '../src/application/CreateCommand.ts';
import { MoveCommand } from '../src/application/MoveCommand.ts';
import { LoadedDocument } from '../src/application/LoadedDocument.ts';
import type { DocumentStore } from '../src/application/DocumentStore.ts';
import type { SvgDocument } from '../src/domain/SvgDocument.ts';

class MemoryStore implements DocumentStore {
  private saved: SvgDocument | undefined;
  fail = false;
  async load(): Promise<LoadedDocument> {
    if (this.fail || !this.saved) throw new Error('cannot read file: memory.svg');
    return new LoadedDocument(this.saved.clone());
  }
  async save(_path: string, document: SvgDocument): Promise<void> {
    if (this.fail) throw new Error('cannot write file: memory.svg');
    this.saved = document.clone();
  }
}

test('history is blocked after IO; successful edit unlocks; failed IO preserves redo', async () => {
  const store = new MemoryStore(); const editor = new Editor(store);
  editor.initialize();
  assert.throws(() => editor.undo(), /undo not allowed after io command/);
  new CreateCommand().execute(editor, new Arguments(['rect', 'r', '1', '2', '3', '4']));
  new MoveCommand().execute(editor, new Arguments(['r', '5', '6']));
  editor.undo(); store.fail = true;
  await assert.rejects(editor.save('memory.svg'), /cannot write file/);
  editor.redo(); assert.equal(editor.document().find('r').attributes().get('x'), '6');
  store.fail = false; await editor.save('memory.svg');
  assert.throws(() => editor.redo(), /undo not allowed after io command/);
  new MoveCommand().execute(editor, new Arguments(['r', '1', '0'])); editor.undo();
  assert.equal(editor.document().find('r').attributes().get('x'), '6');
  assert.throws(() => editor.undo(), /nothing to undo/);
});
test('failing edit preserves document and history, new edit clears redo', () => {
  const editor = new Editor(new MemoryStore()); editor.initialize();
  new CreateCommand().execute(editor, new Arguments(['circle', 'c', '10', '20', '3']));
  new MoveCommand().execute(editor, new Arguments(['c', '2', '0'])); editor.undo();
  assert.throws(() => new CreateCommand().execute(editor, new Arguments(['circle', 'c', '0', '0', '1'])), /id already exists/);
  editor.redo(); assert.equal(editor.document().find('c').attributes().get('cx'), '12');
  editor.undo(); new MoveCommand().execute(editor, new Arguments(['c', '0', '2']));
  assert.throws(() => editor.redo(), /nothing to redo/);
});
