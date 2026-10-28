import { Canvas } from './Canvas.ts';
import { Container } from './Container.ts';
import { Group } from './Group.ts';
import type { SvgShape } from './SvgShape.ts';
import { Validation } from './Validation.ts';

export class SvgDocument {
  private readonly root: Canvas;
  constructor(root: Canvas = new Canvas()) { this.root = root; }
  get canvas(): Canvas { return this.root; }
  all(): readonly SvgShape[] {
    const nodes: SvgShape[] = [];
    const pending = [...this.root.children].reverse();
    while (pending.length) {
      const node = pending.pop()!; nodes.push(node); pending.push(...[...node.children].reverse());
    }
    return nodes;
  }
  find(id: string): SvgShape {
    const shape = this.all().find(node => node.id === id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }
  has(id: string): boolean { return this.all().some(node => node.id === id); }
  container(id?: string): Container {
    if (id === undefined) return this.root;
    if (!this.has(id)) throw new Error(`no such container: ${id}`);
    const node = this.find(id);
    if (!(node instanceof Container)) throw new Error(`not a container: ${id}`);
    return node;
  }
  add(shape: SvgShape, parent: Container = this.root): void {
    const pending = [shape]; const ids = new Set(this.all().map(node => node.id));
    while (pending.length) {
      const node = pending.pop()!; Validation.id(node.id);
      if (ids.has(node.id)) throw new Error(`id already exists: ${node.id}`);
      ids.add(node.id); pending.push(...node.children);
    }
    parent.insert(shape);
  }
  delete(id: string): void { const node = this.find(id); node.parent!.remove(node); }
  group(id: string, ids: readonly string[]): Group {
    Validation.id(id);
    if (this.has(id)) throw new Error(`id already exists: ${id}`);
    if (!ids.length) throw new Error('group requires at least one shape');
    if (new Set(ids).size !== ids.length) throw new Error('duplicate group member');
    const requested = ids.map(member => this.find(member));
    for (const node of requested) {
      if (requested.some(other => other !== node && node.contains(other))) {
        throw new Error(`cannot group a container into its own descendant: ${node.id}`);
      }
    }
    // Preserve existing visual/preorder order, independent of argument order.
    const selected = this.all().filter(node => requested.includes(node));
    let parent = selected[0]!.parent!;
    while (!selected.every(node => parent.contains(node))) parent = parent.parent!;
    const anchor = parent.children.findIndex(child => selected.some(node => child.contains(node)));
    const group = new Group(id);
    parent.insert(group, anchor);
    selected.forEach(node => group.insert(node));
    return group;
  }
  ungroup(id: string): void {
    const group = this.find(id);
    if (!(group instanceof Group)) throw new Error(`not a container: ${id}`);
    if (group.parent === this.root) throw new Error(`cannot ungroup top-level container: ${id}`);
    const parent = group.parent!; const index = parent.children.indexOf(group);
    // Preserve inherited presentation after removing the wrapper.
    for (const child of group.children) {
      const own = child.attributes();
      for (const [key, value] of group.attributes()) {
        if (['fill', 'stroke', 'stroke-width'].includes(key) && !own.has(key)) child.set(key, value);
      }
    }
    const children = group.children;
    parent.remove(group); children.forEach((child, offset) => parent.insert(child, index + offset));
  }
  addTo(gid: string, id: string): void { this.container(gid).insert(this.find(id)); }
  reorder(id: string, front: boolean): void {
    const node = this.find(id); const parent = node.parent!;
    parent.remove(node); parent.insert(node, front ? parent.children.length : 0);
  }
  clone(): SvgDocument { return new SvgDocument(this.root.clone()); }
}
