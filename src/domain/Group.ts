import { Container } from './Container.ts';

export class Group extends Container {
  override get tag(): string { return 'g'; }
  override clone(): Group { const copy = new Group(this.id); this.copyChildrenTo(copy); return copy; }
}
