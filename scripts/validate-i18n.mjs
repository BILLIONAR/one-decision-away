import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const baseKeys = Array.from({ length: 5 }, (_, i) =>
  JSON.parse(fs.readFileSync(new URL(`../i18n_work/chunk.${i + 1}.json`, import.meta.url), 'utf8')),
).flat();
if (baseKeys.length !== 4255 || new Set(baseKeys).size !== 4255) throw new Error('Source chunks must contain 4255 unique keys.');
const locales = process.argv.slice(2).length ? process.argv.slice(2) : ['tr', 'es'];
const requiredKeys = new Set([...baseKeys, 'English', 'Turkish', 'Spanish']);
function collectSourceKeys(directory) {
  for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'i18n') collectSourceKeys(filename);
    } else if (/\.tsx?$/.test(file.name)) {
      const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = (node) => {
        if (ts.isCallExpression(node) && ['t', 'N_'].includes(node.expression.getText(source)) && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
          requiredKeys.add(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
}
collectSourceKeys(new URL('../src', import.meta.url).pathname);
const errors = [];
const parts = (value) => JSON.stringify((value.match(/\{\w+\}/g) || []).sort());
const edgeSpaces = (value) => JSON.stringify([value.match(/^\s*/)[0], value.match(/\s*$/)[0]]);
for (const locale of locales) {
  if (!['tr', 'es'].includes(locale)) throw new Error(`Unknown translation locale: ${locale}`);
  const file = new URL(`../src/i18n/locales/${locale}.ts`, import.meta.url);
  const source = ts.createSourceFile(file.pathname, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const dict = new Map();
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'dict' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      for (const property of node.initializer.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.name) || !ts.isStringLiteral(property.initializer)) {
          errors.push(`${locale}: Dictionary entries must use literal string keys and values.`); continue;
        }
        const key = property.name.text, value = property.initializer.text;
        if (dict.has(key)) errors.push(`${locale}: Duplicate key ${JSON.stringify(key)}`);
        dict.set(key, value);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  let missing = 0, placeholders = 0;
  for (const key of requiredKeys) if (!dict.has(key)) { missing++; errors.push(`${locale}: Missing ${JSON.stringify(key)}`); }
  for (const [key, value] of dict) {
    if (!value.trim() && key.trim()) errors.push(`${locale}: Empty translation ${JSON.stringify(key)}`);
    if (parts(key) !== parts(value)) { placeholders++; errors.push(`${locale}: Placeholder mismatch ${JSON.stringify(key)}`); }
    if (edgeSpaces(key) !== edgeSpaces(value)) errors.push(`${locale}: Edge whitespace mismatch ${JSON.stringify(key)}`);
    for (const token of ['D$', 'One Decision Away', 'AurelyStudio']) {
      if (key.split(token).length !== value.split(token).length) errors.push(`${locale}: Changed protected token ${token}: ${JSON.stringify(key)}`);
    }
  }
  console.log(`${locale}: ${dict.size} entries; missing keys ${missing}; placeholder differences ${placeholders}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
