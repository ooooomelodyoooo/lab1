import type { SvgDocument } from '../domain/SvgDocument.ts';
import type { LoadedDocument } from './LoadedDocument.ts';

export interface DocumentStore {
  load(path: string): Promise<LoadedDocument>;
  save(path: string, document: SvgDocument): Promise<void>;
}
