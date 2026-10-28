import { SvgShape } from './SvgShape.ts';
import { Validation } from './Validation.ts';

/** Composite: the same move/scale/set/delete interface as leaves. */
export abstract class Container extends SvgShape {
  private readonly nodes: SvgShape[] = [];
  override get children(): readonly SvgShape[] { return [...this.nodes]; }
  override contains(other: SvgShape): boolean {
    return super.contains(other) || this.nodes.some(child => child.contains(other));
  }
  insert(child: SvgShape, index = this.nodes.length): void {
    if (child.contains(this)) throw new Error(`cannot move a container into its own descendant: ${child.id}`);
    if (!Number.isInteger(index) || index < 0 || index > this.nodes.length) throw new Error('invalid child position');
    child.parent?.remove(child);
    this.nodes.splice(Math.min(index, this.nodes.length), 0, child);
    child.attachTo(this);
  }
  remove(child: SvgShape): void {
    const index = this.nodes.indexOf(child);
    if (index < 0) throw new Error(`no such child: ${child.id}`);
    this.nodes.splice(index, 1); child.attachTo(undefined);
  }
  override move(dx: number, dy: number): void { this.nodes.forEach(child => child.move(dx, dy)); }
  override scale(factor: number): void {
    Validation.positive(factor, 'scale factor'); this.nodes.forEach(child => child.scale(factor));
  }
  override configure(args: readonly string[]): void { Validation.count(args, 0); }
  override describe(): string { return `${this.label}${this.paintSummary() ? ` ${this.paintSummary()}` : ''}`; }
  protected copyChildrenTo(target: Container): void {
    this.copyPresentation(target); this.nodes.forEach(child => target.insert(child.clone()));
  }
}
