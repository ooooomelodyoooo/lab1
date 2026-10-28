import { SvgDocument } from '../domain/SvgDocument.ts';
import { Canvas } from '../domain/Canvas.ts';
import { Container } from '../domain/Container.ts';
import type { SvgShape } from '../domain/SvgShape.ts';
import { ShapeFactory } from '../domain/ShapeFactory.ts';
import { Validation } from '../domain/Validation.ts';
import { LoadedDocument } from '../application/LoadedDocument.ts';
import { XmlParser } from './XmlParser.ts';
import type { XmlElement } from './XmlElement.ts';
import { UniformTransform } from './UniformTransform.ts';

export class SvgCodec {
  private readonly factory = new ShapeFactory();
  decode(xml: string): LoadedDocument {
    const root = new XmlParser().parse(xml);
    const attrs = new Map(root.attributes);
    const viewBox = attrs.get('viewBox')?.trim().split(/[\s,]+/u).map(v => Validation.number(v, 'viewBox'));
    if (viewBox) {
      Validation.count(viewBox, 4);
      if (viewBox[0] !== 0 || viewBox[1] !== 0) throw new Error('only a zero-origin viewBox is supported');
    }
    const width = this.dimension(attrs.get('width'), viewBox?.[2] ?? 800, 'width');
    const height = this.dimension(attrs.get('height'), viewBox?.[3] ?? 600, 'height');
    if (viewBox && (viewBox[2] !== width || viewBox[3] !== height)) throw new Error('viewBox must match canvas dimensions');
    const canvas = new Canvas(width, height); const document = new SvgDocument(canvas);
    for (const key of ['width', 'height', 'viewBox', 'id', 'version']) attrs.delete(key);
    canvas.importAttributes(attrs, root.content);
    // Reserve every explicit id before assigning any missing one (including later siblings).
    const reserved = new Set<string>(); const pending = [...root.children];
    while (pending.length) {
      const node = pending.pop()!; const id = node.attributes.get('id');
      if (id !== undefined) {
        Validation.id(id);
        if (reserved.has(id)) throw new Error(`id already exists: ${id}`);
        reserved.add(id);
      }
      pending.push(...node.children);
    }
    const warnings: string[] = []; const counters = new Map<string, number>();
    for (const child of root.children) this.readShape(child, document, canvas, reserved, counters, warnings);
    this.transform(canvas, root.attributes.get('transform'));
    return new LoadedDocument(document, warnings);
  }
  private readShape(element: XmlElement, document: SvgDocument, parent: Container,
    reserved: Set<string>, counters: Map<string, number>, warnings: string[]): void {
    const attrs = new Map(element.attributes);
    let id = attrs.get('id');
    if (id === undefined) {
      let counter = counters.get(element.tag) ?? 0;
      do { id = `${element.tag}${++counter}`; } while (reserved.has(id));
      counters.set(element.tag, counter); reserved.add(id); attrs.set('id', id);
      warnings.push(`warning: assigned id ${id} to unnamed <${element.tag}>`);
    }
    const shape = this.factory.empty(element.tag, id);
    shape.importAttributes(attrs, element.content); document.add(shape, parent);
    if (element.children.length && !(shape instanceof Container)) throw new Error(`children not allowed in <${element.tag}>`);
    if (shape instanceof Container) {
      for (const child of element.children) this.readShape(child, document, shape, reserved, counters, warnings);
    }
    this.transform(shape, attrs.get('transform'));
  }
  private transform(shape: SvgShape, value: string | undefined): void {
    if (value === undefined) return;
    const transform = UniformTransform.parse(value);
    shape.scale(transform.factor); shape.move(transform.dx, transform.dy);
  }
  private dimension(value: string | undefined, fallback: number, name: string): number {
    return value === undefined ? fallback : Validation.positive(value.replace(/px$/u, ''), name);
  }
  encode(document: SvgDocument): string {
    const canvas = document.canvas;
    const attributes = new Map([
      ['xmlns', 'http://www.w3.org/2000/svg'], ['width', String(canvas.width)], ['height', String(canvas.height)],
      ['viewBox', `0 0 ${canvas.width} ${canvas.height}`],
      ...[...canvas.attributes()].filter(([key]) => key !== 'id'),
    ]);
    return ['<?xml version="1.0" encoding="UTF-8"?>', `<svg${this.attributes(attributes)}>`,
      ...canvas.children.map(child => this.writeShape(child, 1)), '</svg>', ''].join('\n');
  }
  private writeShape(shape: SvgShape, depth: number): string {
    const indent = '  '.repeat(depth); const open = `${indent}<${shape.tag}${this.attributes(shape.attributes())}`;
    if (shape.content !== undefined) return `${open}>${this.escape(shape.content)}</${shape.tag}>`;
    if (!shape.children.length) return `${open}/>`;
    return [`${open}>`, ...shape.children.map(child => this.writeShape(child, depth + 1)), `${indent}</${shape.tag}>`].join('\n');
  }
  private attributes(attributes: ReadonlyMap<string, string>): string {
    return [...attributes].map(([key, value]) => ` ${key}="${this.escape(value)}"`).join('');
  }
  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\r/g, '&#13;').replace(/\n/g, '&#10;').replace(/\t/g, '&#9;');
  }
}
