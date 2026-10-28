export class XmlElement {
  private readonly name: string;
  private readonly attrs: ReadonlyMap<string, string>;
  private readonly nodes: XmlElement[] = [];
  private text = '';
  constructor(name: string, attributes: ReadonlyMap<string, string>) { this.name = name; this.attrs = new Map(attributes); }
  get tag(): string { return this.name; }
  get attributes(): ReadonlyMap<string, string> { return new Map(this.attrs); }
  get children(): readonly XmlElement[] { return [...this.nodes]; }
  get content(): string { return this.text; }
  append(child: XmlElement): void { this.nodes.push(child); }
  appendText(text: string): void { this.text += text; }
}
