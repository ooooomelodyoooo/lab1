import { Editor } from '../application/Editor.ts';
import { NodeSvgStore } from '../infrastructure/NodeSvgStore.ts';
import { SvgCodec } from '../infrastructure/SvgCodec.ts';
import { Cli } from './Cli.ts';
import { Repl } from './Repl.ts';

await new Repl(new Cli(new Editor(new NodeSvgStore(new SvgCodec())))).run();
