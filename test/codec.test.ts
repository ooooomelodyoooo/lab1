import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SvgCodec } from '../src/infrastructure/SvgCodec.ts';

const codec = new SvgCodec();
const svg = (body: string, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" ${attrs}>${body}</svg>`;

test('missing ids reserve later explicit ids, names are case-sensitive, all types round-trip', () => {
  const loaded = codec.decode(svg('<g><rect/><rect id="rect1"/><circle/><ellipse/><line/><text>A &amp; B</text><rect id="Rect1"/></g>'));
  assert.deepEqual(loaded.warnings, [
    'warning: assigned id g1 to unnamed <g>', 'warning: assigned id rect2 to unnamed <rect>',
    'warning: assigned id circle1 to unnamed <circle>', 'warning: assigned id ellipse1 to unnamed <ellipse>',
    'warning: assigned id line1 to unnamed <line>', 'warning: assigned id text1 to unnamed <text>',
  ]);
  const result = codec.decode(codec.encode(loaded.document));
  assert.equal(result.document.all().length, 8); assert.deepEqual(result.warnings, []);
  assert.equal(result.document.find('text1').content, 'A & B');
  assert.equal(result.document.find('rect2').attributes().has('fill'), false);
});
test('XML escaping, CDATA, unicode and presentation attributes survive', () => {
  const doc = codec.decode(svg('<text id="t" x="3" font-size="16" text-anchor="middle"><![CDATA[开始 < & "quoted"]]></text>')).document;
  doc.find('t').set('text', '开始 < & "quoted"\nnext\tline\r');
  const encoded = codec.encode(doc);
  assert.match(encoded, /&lt; &amp; &quot;/);
  const restored = codec.decode(encoded).document;
  assert.equal(restored.find('t').content, doc.find('t').content);
  assert.equal(restored.find('t').attributes().get('font-size'), '16');
});
test('nested translate/scale transforms normalize into geometry', () => {
  const doc = codec.decode(svg('<g id="outer" transform="translate(60,40)"><g id="inner" transform="translate(200,0) scale(0.8)"><rect id="r" width="120" height="60"/></g></g>')).document;
  assert.equal(doc.find('r').attributes().get('x'), '260');
  assert.equal(doc.find('r').attributes().get('y'), '40');
  assert.equal(doc.find('r').attributes().get('width'), '96');
  assert.equal(doc.find('r').attributes().get('height'), '48');
});
for (const [name, body, pattern] of [
  ['duplicate id', '<rect id="x"/><g id="x"/>', /id already exists: x/],
  ['unknown type', '<path id="p"/>', /unknown shape type: path/],
  ['nested leaf child', '<rect id="r"><circle id="c"/></rect>', /children not allowed/],
  ['invalid geometry', '<circle id="c" r="-1"/>', /r must be non-negative/],
  ['unsupported attribute', '<rect id="r" onclick="x"/>', /unsupported SVG attribute: onclick/],
  ['unknown entity', '<text id="t">&missing;</text>', /undefined entity/],
  ['malformed XML', '<g id="g">', /unexpected close tag/],
  ['unsupported transform', '<g id="g" transform="rotate(20)"/>', /unsupported SVG transform/],
] as const) test(`rejects ${name}`, () => assert.throws(() => codec.decode(svg(body)), pattern));
test('DOCTYPE, invalid root, invalid viewBox and namespaces fail explicitly', () => {
  assert.throws(() => codec.decode('<!DOCTYPE svg SYSTEM "file:///etc/passwd">'+svg('')), /DOCTYPE/);
  assert.throws(() => codec.decode('<html/>'), /expected <svg>/);
  assert.throws(() => codec.decode(svg('', 'viewBox="1 2 400 300"')), /zero-origin/);
  assert.throws(() => codec.decode(svg('', 'viewBox="0 0 200 100"')), /match canvas/);
  assert.throws(() => codec.decode('<svg xmlns="urn:other"/>'), /namespace/);
});

test('imported transform preserves inherited text sizing and stroke widths', () => {
  const doc = codec.decode(svg('<g id="g" font-size="20" stroke="black" stroke-width="4" transform="scale(2)"><text id="t" x="2" y="3">A</text><rect id="r" width="4" height="5"/></g>')).document;
  assert.equal(doc.find('t').attributes().get('font-size'),'40');
  assert.equal(doc.find('r').attributes().get('stroke-width'),'8');
  assert.equal(doc.find('t').attributes().get('stroke-width'),'8');
});
test('ungroup preserves inherited presentation and explicit child overrides', () => {
  const doc = codec.decode(svg('<g id="scene"><g id="g" fill="red" font-size="20"><text id="t">A</text><rect id="r" fill="blue"/></g></g>')).document;
  doc.ungroup('g');
  assert.equal(doc.find('t').attributes().get('fill'),'red');
  assert.equal(doc.find('t').attributes().get('font-size'),'20');
  assert.equal(doc.find('r').attributes().get('fill'),'blue');
});
