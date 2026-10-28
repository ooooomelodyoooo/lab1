import type { SvgDocument } from '../domain/SvgDocument.ts';

export class LoadedDocument {
  private readonly value: SvgDocument;
  private readonly messages: readonly string[];
  constructor(document: SvgDocument, warnings: readonly string[] = []) { this.value = document; this.messages = [...warnings]; }
  get document(): SvgDocument { return this.value; }
  get warnings(): readonly string[] { return [...this.messages]; }
}
