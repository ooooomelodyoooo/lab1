import ts from 'typescript';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, basename, dirname } from 'node:path';

const root = resolve('src');
const files = [];
async function walk(path) {
  for (const item of await readdir(path, { withFileTypes: true })) {
    const target = resolve(path, item.name);
    if (item.isDirectory()) await walk(target);
    else if (item.name.endsWith('.ts')) files.push(target);
  }
}
await walk(root);
const allowed = {
  domain: new Set(['domain']),
  application: new Set(['application', 'domain']),
  infrastructure: new Set(['infrastructure', 'application', 'domain']),
  cli: new Set(['cli', 'application', 'domain']),
};
const errors = [];
let imports = 0;
for (const path of files) {
  const name = relative(root, path);
  const layer = name.split('/')[0];
  const source = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const classes = source.statements.filter(ts.isClassDeclaration);
  if (classes.length > 1 || (classes.length && classes[0].name?.text !== basename(path, '.ts'))) {
    errors.push(`${name}: expected one class in its namesake file`);
  }
  const visit = node => {
    if (ts.isSwitchStatement(node)) errors.push(`${name}: switch dispatch is forbidden`);
    if (ts.isFunctionDeclaration(node)) errors.push(`${name}: use class behavior instead of free functions`);
    ts.forEachChild(node, visit);
  };
  visit(source);
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    imports++;
    const target = node.moduleSpecifier.text;
    if (target.startsWith('.')) {
      const destination = relative(root, resolve(dirname(path), target)).split('/')[0];
      const compositionRoot = name === 'cli/Main.ts' && destination === 'infrastructure';
      if (!allowed[layer]?.has(destination) && !compositionRoot) errors.push(`${name}: forbidden dependency ${target}`);
    } else {
      const cliRuntime = layer === 'cli' && ['node:process', 'node:readline'].includes(target);
      if (layer !== 'infrastructure' && !cliRuntime) errors.push(`${name}: external dependency ${target}`);
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Architecture OK: ${files.length} source files, ${imports} imports; layer rules, class filenames and dispatch syntax checked.`);
