import { readFile, writeFile, rename, rm, lstat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DocumentStore } from '../application/DocumentStore.ts';
import type { LoadedDocument } from '../application/LoadedDocument.ts';
import type { SvgDocument } from '../domain/SvgDocument.ts';
import type { SvgCodec } from './SvgCodec.ts';

export class NodeSvgStore implements DocumentStore {
  private readonly codec: SvgCodec;
  constructor(codec: SvgCodec) { this.codec = codec; }
  async load(path: string): Promise<LoadedDocument> {
    let xml: string;
    try { xml = await readFile(path, 'utf8'); }
    catch { throw new Error(`cannot read file: ${path}`); }
    return this.codec.decode(xml);
  }
  async save(path: string, document: SvgDocument): Promise<void> {
    const xml = this.codec.encode(document);
    const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    try {
      const target = await lstat(path).catch(error => {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
        throw error;
      });
      if (target && (!target.isFile() || !(target.mode & 0o222))) throw new Error('target is not a writable regular file');
      await writeFile(temporary, xml, { encoding: 'utf8', flag: 'wx', mode: target?.mode ?? 0o644 });
      await rename(temporary, path);
    } catch { throw new Error(`cannot write file: ${path}`); }
    finally { await rm(temporary, { force: true }).catch(() => undefined); }
  }
}
