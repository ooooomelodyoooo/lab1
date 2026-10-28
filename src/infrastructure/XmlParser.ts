import { SaxesParser } from 'saxes';
import { XmlElement } from './XmlElement.ts';

export class XmlParser {
  parse(xml: string): XmlElement {
    const parser = new SaxesParser({ xmlns: true });
    const stack: XmlElement[] = [];
    let root: XmlElement | undefined;
    parser.on('doctype', () => { throw new Error('DOCTYPE is not supported'); });
    parser.on('processinginstruction', () => { throw new Error('XML processing instructions are not supported'); });
    parser.on('opentag', tag => {
      if (tag.uri !== 'http://www.w3.org/2000/svg' && tag.uri !== '') throw new Error(`unsupported XML namespace: ${tag.uri}`);
      const attrs = new Map<string, string>();
      for (const attribute of Object.values(tag.attributes)) {
        if (attribute.uri === 'http://www.w3.org/2000/xmlns/') continue;
        if (attribute.prefix) throw new Error(`unsupported SVG attribute: ${attribute.name}`);
        attrs.set(attribute.local, attribute.value);
      }
      const element = new XmlElement(tag.local, attrs);
      if (stack.length) stack.at(-1)!.append(element); else root = element;
      stack.push(element);
    });
    parser.on('text', text => { stack.at(-1)?.appendText(text); });
    parser.on('cdata', text => { stack.at(-1)?.appendText(text); });
    parser.on('closetag', () => { stack.pop(); });
    parser.write(xml).close();
    if (!root || root.tag !== 'svg') throw new Error('expected <svg> root');
    return root;
  }
}
