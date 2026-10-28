import { Validation } from '../domain/Validation.ts';

/** Normalizes the introduction's translate/positive uniform-scale SVG transforms. */
export class UniformTransform {
  private scaleValue = 1;
  private x = 0;
  private y = 0;
  get factor(): number { return this.scaleValue; }
  get dx(): number { return this.x; }
  get dy(): number { return this.y; }
  static parse(value: string): UniformTransform {
    const transform = new UniformTransform();
    let rest = value.trim();
    while (rest) {
      const translation = /^translate\s*\(([^()]*)\)/u.exec(rest);
      const scaling = /^scale\s*\(([^()]*)\)/u.exec(rest);
      const match = translation ?? scaling;
      if (!match) throw new Error('unsupported SVG transform; use translate and positive uniform scale');
      const params = match[1]!.trim().split(/[\s,]+/u).map(v => Validation.number(v, 'transform'));
      Validation.count(params, 1, 2);
      if (translation) {
        transform.x += transform.scaleValue * params[0]!;
        transform.y += transform.scaleValue * (params[1] ?? 0);
      } else {
        const factor = Validation.positive(params[0]!, 'transform scale');
        if (params.length === 2 && params[1] !== factor) throw new Error('non-uniform SVG scale is not supported');
        transform.scaleValue *= factor;
      }
      rest = rest.slice(match[0].length).trimStart();
      if (rest.startsWith(',')) rest = rest.slice(1).trimStart();
    }
    return transform;
  }
}
