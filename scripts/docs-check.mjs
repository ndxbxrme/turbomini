import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = new URL('..', import.meta.url).pathname;
const docsDir = path.join(rootDir, 'docs');
const componentsDir = path.join(docsDir, 'src', 'components');
const examplesDir = path.join(rootDir, 'examples');

const missing = [];
const warn = [];

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const extractArrayStrings = (source, regex) => {
  const match = source.match(regex);
  if (!match) return [];
  const arrayBody = match[1];
  const strings = [];
  const strRegex = /'([^']+)'/g;
  let m;
  while ((m = strRegex.exec(arrayBody))) {
    strings.push(m[1]);
  }
  return strings;
};

const indexSource = await readFile(path.join(docsDir, 'src', 'index.js'), 'utf8');

const templateNames = extractArrayStrings(
  indexSource,
  /fetchTemplates\(\s*\[([\s\S]*?)\]\s*,/m
);

if (!templateNames.length) {
  throw new Error('docs:check failed: unable to parse templates from docs/src/index.js');
}

for (const name of templateNames) {
  const filePath = path.join(componentsDir, `${name}.html`);
  if (!(await fileExists(filePath))) {
    missing.push(`Missing template: docs/src/components/${name}.html`);
  }
}

const exampleHrefs = [];
const exampleMatches = indexSource.match(/href:\s*'([^']+)'/g) || [];
for (const entry of exampleMatches) {
  const match = entry.match(/href:\s*'([^']+)'/);
  if (match) exampleHrefs.push(match[1]);
}

for (const href of exampleHrefs) {
  const match = href.match(/^\.\.\/examples\/([^/]+)\/?/);
  if (!match) continue;
  const folder = match[1];
  const dirPath = path.join(examplesDir, folder);
  if (!(await fileExists(dirPath))) {
    missing.push(`Missing example directory: examples/${folder}`);
  }
}

const headerSource = await readFile(path.join(componentsDir, 'header.html'), 'utf8');
const hrefMatches = headerSource.match(/href="([^"]+)"/g) || [];
for (const entry of hrefMatches) {
  const match = entry.match(/href="([^"]+)"/);
  if (!match) continue;
  const href = match[1];
  if (href.startsWith('http')) continue;
  if (href.startsWith('#')) continue;
  if (href.startsWith('/')) {
    const route = href.replace(/^\//, '').replace(/\/$/, '');
    if (!route) continue;
    const templatePath = path.join(componentsDir, `${route}.html`);
    if (!(await fileExists(templatePath))) {
      warn.push(`Nav link missing template: docs/src/components/${route}.html`);
    }
  }
}

if (missing.length || warn.length) {
  if (missing.length) {
    console.error('\nDocs check failed:');
    for (const item of missing) console.error(`- ${item}`);
  }
  if (warn.length) {
    console.warn('\nDocs check warnings:');
    for (const item of warn) console.warn(`- ${item}`);
  }
  if (missing.length) process.exit(1);
}

console.log('Docs check passed.');
