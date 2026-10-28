import type { SvgShape } from '../domain/SvgShape.ts';

export class TreeRenderer {
  render(root: SvgShape): string {
    const lines = [root.describe()]; this.children(root, '', lines); return lines.join('\n');
  }
  private children(parent: SvgShape, prefix: string, lines: string[]): void {
    const children = parent.children;
    children.forEach((node, index) => {
      const last = index === children.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${node.describe()}`);
      this.children(node, prefix + (last ? '    ' : '│   '), lines);
    });
  }
  show(shape: SvgShape): string {
    const lines = [`${shape.label}  parent=${shape.parent?.label ?? 'none'}`];
    for (const [key, value] of shape.attributes()) if (key !== 'id') lines.push(`  ${key}=${value}`);
    if (shape.content !== undefined) lines.push(`  text=${JSON.stringify(shape.content)}`);
    return lines.join('\n');
  }
}
