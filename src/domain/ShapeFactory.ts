import { Rect } from './Rect.ts';
import { Circle } from './Circle.ts';
import { Ellipse } from './Ellipse.ts';
import { Line } from './Line.ts';
import { Text } from './Text.ts';
import { Group } from './Group.ts';
import type { SvgShape } from './SvgShape.ts';
import { Validation } from './Validation.ts';

/** The sole type-name dispatch point. Plugin discovery is deferred to a later phase. */
export class ShapeFactory {
  private readonly types: ReadonlyMap<string, new (id: string) => SvgShape> = new Map<string, new (id: string) => SvgShape>([
    ['rect', Rect], ['circle', Circle], ['ellipse', Ellipse], ['line', Line], ['text', Text], ['g', Group],
  ]);
  empty(type: string, id: string): SvgShape {
    const Shape = this.types.get(type);
    if (!Shape) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    Validation.id(id); return new Shape(id);
  }
  create(type: string, id: string, args: readonly string[]): SvgShape {
    const shape = this.empty(type, id); shape.configure(args); return shape;
  }
}
