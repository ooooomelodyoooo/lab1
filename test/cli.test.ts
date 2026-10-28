import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '../src/application/Editor.ts';
import { Cli } from '../src/cli/Cli.ts';
import { Lexer } from '../src/cli/Lexer.ts';
import { NodeSvgStore } from '../src/infrastructure/NodeSvgStore.ts';
import { SvgCodec } from '../src/infrastructure/SvgCodec.ts';

const make = () => new Cli(new Editor(new NodeSvgStore(new SvgCodec())));
async function ok(cli: Cli, line: string): Promise<string> {
  const result = await cli.executeLine(line);
  assert.ok(!result.startsWith('error:'), `${line}: ${result}`); return result;
}

test('lexer handles comments, colors, quoted in, empty text, escapes and rejects malformed input', () => {
  const lexer = new Lexer();
  assert.equal(lexer.parse('   # comment'), undefined);
  assert.equal(lexer.parse('  '), undefined);
  assert.deepEqual(lexer.parse('create rect r 0 0 2 3 #fff')!.args.all(), ['rect','r','0','0','2','3','#fff']);
  assert.equal(lexer.parse(String.raw`create text t 1 2 "a\n\"b\"\\"`)!.args.at(4), 'a\n"b"\\');
  assert.equal(lexer.parse('create text t 1 2 ""')!.args.at(4), '');
  assert.equal(lexer.parse('create text t 1 2 "in"')!.args.parentId, undefined);
  assert.throws(() => lexer.parse('set t text "broken'), /unterminated/);
  assert.throws(() => lexer.parse('set t text "a"b'), /space after/);
});

test('help works before init; otherwise a document is required; errors are one line', async () => {
  const cli = make();
  assert.match(await cli.executeLine('help'), /ungroup <gid>/);
  assert.equal(await cli.executeLine('tree'), "error: no document. use 'init' or 'read' first");
  assert.equal(await cli.executeLine('create rect r 0 0 1 1'), "error: no document. use 'init' or 'read' first");
  assert.match(await cli.executeLine('wrong'), /^error: unknown command/);
  await ok(cli, 'init');
  const result = await cli.executeLine(String.raw`create "wrong\nname" id`);
  assert.equal(result.split('\n').length, 1);
});

for (const [type, params, original, scaled] of [
  ['rect', '1 2 3 4', 'x=1 y=2 w=3 h=4', 'x=2 y=4 w=6 h=8'],
  ['circle', '1 2 3', 'cx=1 cy=2 r=3', 'cx=2 cy=4 r=6'],
  ['ellipse', '1 2 3 4', 'cx=1 cy=2 rx=3 ry=4', 'cx=2 cy=4 rx=6 ry=8'],
  ['line', '1 2 3 4', '(1,2) -> (3,4)', '(2,4) -> (6,8)'],
  ['text', '1 2 "中文 with spaces"', '(1,2) "中文 with spaces"', '(2,4) "中文 with spaces"'],
] as const) test(`${type} creation, scaling all geometry, set, move, undo and redo`, async () => {
  const cli = make(); await ok(cli,'init'); await ok(cli,`create ${type} s ${params}`);
  assert.ok((await ok(cli,'tree s')).includes(original));
  await ok(cli,'scale s 2'); assert.ok((await ok(cli,'tree s')).includes(scaled));
  await ok(cli,'undo'); assert.ok((await ok(cli,'tree s')).includes(original));
  await ok(cli,'redo'); assert.ok((await ok(cli,'tree s')).includes(scaled));
  await ok(cli,'set s stroke-width 2.5'); await ok(cli,'move s 0.5 -1');
  assert.match(await ok(cli,'show s'), /stroke-width=2.5/);
  assert.match(await cli.executeLine('set s id other'), /^error: unknown attribute: id$/);
});

test('all Composite edits are atomic undo units, preserve parents and child order', async () => {
  const cli = make(); await ok(cli,'init 400 300');
  for (const line of ['create g scene', 'create g left in scene', 'create g right in scene',
    'create rect a 1 2 3 4 in left', 'create circle b 5 6 7 in right', 'create text c 8 9 "标签" in scene']) await ok(cli,line);
  const before = await ok(cli,'tree');
  await ok(cli,'group pair b a');
  assert.ok((await ok(cli,'tree pair')).indexOf('rect#a') < (await ok(cli,'tree pair')).indexOf('circle#b'));
  await ok(cli,'undo'); assert.equal(await ok(cli,'tree'), before);
  await ok(cli,'redo'); await ok(cli,'ungroup pair'); await ok(cli,'undo'); await ok(cli,'redo');
  await ok(cli,'addto right c'); assert.match(await ok(cli,'show c'), /parent=g#right/);
  await ok(cli,'undo'); assert.match(await ok(cli,'show c'), /parent=g#scene/);
  await ok(cli,'front a'); await ok(cli,'back b'); await ok(cli,'set scene fill red');
  const subtree = await ok(cli,'tree'); await ok(cli,'delete scene'); assert.equal(await ok(cli,'tree'), 'svg (400x300)');
  await ok(cli,'undo'); assert.equal(await ok(cli,'tree'), subtree);
});

for (const [line, expected] of [
  ['create rect r 0 0 1 1', 'id already exists: r'],
  ['create box box1', 'unknown shape type: box (is the plugin loaded?)'],
  ['create hexagon x', 'unknown shape type: hexagon (is the plugin loaded?)'],
  ['create circle x 0 0 1 in missing', 'no such container: missing'],
  ['create circle x 0 0 1 in r', 'not a container: r'],
  ['move missing 1 1', 'no such shape: missing'],
  ['scale r 0', 'scale factor must be positive'],
  ['scale r -2', 'scale factor must be positive'],
  ['set r label title', 'unknown attribute: label'],
  ['set r width -1', 'width must be non-negative'],
  ['set r stroke-width -1', 'stroke-width must be non-negative'],
  ['group bad scene r', 'cannot group a container into its own descendant: scene'],
  ['ungroup scene', 'cannot ungroup top-level container: scene'],
  ['addto inner scene', 'cannot move a container into its own descendant: scene'],
] as const) test(`error contract and unchanged state: ${line}`, async () => {
  const cli = make();
  for (const setup of ['init','create g scene','create g inner in scene','create rect r 0 0 1 1 in inner']) await ok(cli,setup);
  const before = await ok(cli,'tree');
  assert.equal(await cli.executeLine(line), `error: ${expected}`);
  assert.equal(await ok(cli,'tree'), before);
  await ok(cli,'undo'); assert.match(await cli.executeLine('show r'), /no such shape/);
});

test('overflow midway through a recursive operation cannot publish partial changes', async () => {
  const cli = make();
  for (const line of ['init','create g scene','create rect first 1 2 3 4 in scene','create circle huge 1e308 0 1 in scene']) await ok(cli,line);
  const before = await ok(cli,'tree');
  assert.match(await cli.executeLine('scale scene 2'), /^error: invalid number/);
  assert.equal(await ok(cli,'tree'), before);
  await ok(cli,'undo'); assert.match(await cli.executeLine('show huge'), /no such shape/);
});

test('display leaves redo intact; canvas changes lock history and reject invalid sizes atomically', async () => {
  const cli = make(); await ok(cli,'init'); await ok(cli,'create g scene'); await ok(cli,'undo');
  await ok(cli,'help'); await ok(cli,'tree'); await ok(cli,'canvas'); await ok(cli,'redo');
  assert.match(await cli.executeLine('canvas -1 200'), /^error:/); await ok(cli,'undo'); await ok(cli,'redo');
  await ok(cli,'canvas 200 100'); assert.equal(await ok(cli,'canvas'),'svg (200x100)');
  assert.equal(await cli.executeLine('undo'),'error: undo not allowed after io command');
  assert.equal(await cli.executeLine('redo'),'error: undo not allowed after io command');
  await ok(cli,'create g next'); await ok(cli,'undo');
  assert.match(await cli.executeLine('undo'), /nothing to undo/);
});
