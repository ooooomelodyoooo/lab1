import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Editor } from '../src/application/Editor.ts';
import { Cli } from '../src/cli/Cli.ts';
import { NodeSvgStore } from '../src/infrastructure/NodeSvgStore.ts';
import { SvgCodec } from '../src/infrastructure/SvgCodec.ts';

const make = () => new Cli(new Editor(new NodeSvgStore(new SvgCodec())));
test('file paths with spaces, default save, round-trip and IO barriers', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'svg-lab-')); t.after(() => rm(dir,{recursive:true,force:true}));
  const path = join(dir,'my diagram.svg'); const cli = make();
  await cli.executeLine('init 400 300'); await cli.executeLine('create text t 10 20 "你好 SVG"');
  assert.match(await cli.executeLine('save'), /^error: no file path/);
  assert.match(await cli.executeLine(`save "${path}"`), /^saved to/);
  assert.equal(await cli.executeLine('undo'), 'error: undo not allowed after io command');
  await cli.executeLine('set t text "更新"');
  assert.match(await cli.executeLine('save'), /^saved to/);
  await cli.executeLine('init'); assert.match(await cli.executeLine(`read "${path}"`), /^read/);
  assert.match(await cli.executeLine('show t'), /text="更新"/);
  assert.equal(await cli.executeLine('redo'), 'error: undo not allowed after io command');
  assert.match(await readFile(path,'utf8'), /viewBox="0 0 400 300"/);
});
test('failed read/save preserves current document and undo/redo; no partial import warnings', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'svg-lab-')); t.after(() => rm(dir,{recursive:true,force:true}));
  const bad = join(dir,'bad.svg'); const locked = join(dir,'locked.svg');
  await writeFile(bad, '<svg><rect/><path/></svg>'); await writeFile(locked, 'original'); await chmod(locked, 0o444);
  const cli = make(); await cli.executeLine('init'); await cli.executeLine('create circle c 1 2 3');
  await cli.executeLine('move c 10 0'); await cli.executeLine('undo');
  const before = await cli.executeLine('tree');
  for (const [command, expected] of [
    [`read "${join(dir,'missing.svg')}"`, `error: cannot read file: ${join(dir,'missing.svg')}`],
    [`read "${bad}"`, 'error: unknown shape type: path (is the plugin loaded?)'],
    [`save "${locked}"`, `error: cannot write file: ${locked}`],
    [`save "${join(dir,'missing','a.svg')}"`, `error: cannot write file: ${join(dir,'missing','a.svg')}`],
  ]) {
    assert.equal(await cli.executeLine(command!), expected);
    assert.equal(await cli.executeLine('tree'), before);
  }
  assert.equal(await readFile(locked,'utf8'),'original');
  assert.match(await cli.executeLine('redo'), /^redone:/);
  assert.match(await cli.executeLine('tree'), /cx=11/);
});
test('read assigns warnings only on success, resets path and history', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'svg-lab-')); t.after(() => rm(dir,{recursive:true,force:true}));
  const path = join(dir,'import.svg'); await writeFile(path,'<svg width="10" height="20"><rect width="2" height="3"/></svg>');
  const cli = make();
  assert.equal(await cli.executeLine(`read "${path}"`), `warning: assigned id rect1 to unnamed <rect>\nread ${path} (1 elements)`);
  await cli.executeLine('move rect1 1 2'); assert.match(await cli.executeLine('save'), /^saved to/);
  await cli.executeLine('init'); assert.match(await cli.executeLine('save'), /^error: no file path/);
});
test('real REPL processes sequential stdin, recovers after errors and emits prompts', () => {
  const result = spawnSync(process.execPath, ['src/cli/Main.ts'], {
    cwd: resolve('.'), encoding:'utf8',
    input:'# script\ninit\ncreate text t 20 40 "CLI test"\nmove missing 1 1\nshow t\nundo\ntree\n',
  });
  assert.equal(result.status,1); assert.equal(result.stderr,'');
  assert.match(result.stdout,/svg-editor 0.1/); assert.match(result.stdout,/svg> /);
  assert.match(result.stdout,/error: no such shape: missing/); assert.match(result.stdout,/text="CLI test"/);
  assert.match(result.stdout,/undone: text#t created/);
});
test('real REPL successfully saves and reloads a diagram', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'svg-lab-')); t.after(() => rm(dir,{recursive:true,force:true}));
  const path = join(dir,'diagram.svg');
  const result = spawnSync(process.execPath, ['src/cli/Main.ts'], {
    cwd:resolve('.'),encoding:'utf8',input:`init 400 200\ncreate g flow\ncreate rect start 30 70 120 60 #4a90d9 in flow\ncreate line edge 150 100 250 100 black in flow\ncreate rect end 250 70 120 60 #f5a623 in flow\nsave "${path}"\nread "${path}"\ntree\n`,
  });
  assert.equal(result.status,0,result.stdout+result.stderr);
  const doc = new SvgCodec().decode(await readFile(path,'utf8')).document;
  assert.equal(doc.all().length,4); assert.equal(doc.find('start').parent!.id,'flow');
});
