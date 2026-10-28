import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SvgDocument } from '../src/domain/SvgDocument.ts';
import { ShapeFactory } from '../src/domain/ShapeFactory.ts';

const factory = new ShapeFactory();
test('Composite moves and scales nested leaves, clones remain independent', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'scene', []));
  doc.add(factory.create('g', 'node', []), doc.container('scene'));
  doc.add(factory.create('rect', 'r', ['10', '20', '30', '40']), doc.container('node'));
  doc.add(factory.create('text', 't', ['15', '30', '开始']), doc.container('node'));
  const before = doc.clone();
  doc.find('node').move(5, -10); doc.find('scene').scale(2);
  assert.equal(doc.find('r').attributes().get('x'), '30');
  assert.equal(doc.find('r').attributes().get('height'), '80');
  assert.equal(doc.find('t').content, '开始');
  assert.equal(before.find('r').attributes().get('x'), '10');
});
test('group order, ancestry validation, nested ungroup and z-order', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'scene', []));
  for (const id of ['a', 'b', 'c']) doc.add(factory.create('circle', id, ['1','2','3']), doc.container('scene'));
  doc.group('pair', ['c', 'a']);
  assert.deepEqual(doc.find('pair').children.map(n => n.id), ['a', 'c']);
  assert.throws(() => doc.group('bad', ['scene', 'a']), /own descendant: scene/);
  assert.throws(() => doc.ungroup('scene'), /top-level/);
  doc.ungroup('pair');
  assert.deepEqual(doc.find('scene').children.map(n => n.id), ['a', 'c', 'b']);
  doc.reorder('a', true);
  assert.deepEqual(doc.find('scene').children.map(n => n.id), ['c', 'b', 'a']);
  assert.throws(() => doc.addTo('scene', 'scene'), /own descendant/);
});
