// Wypisuje wszystkie TODO z site.config.mjs (npm run todo).
// Build wypisuje to samo w skrócie na końcu.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function collectTodos() {
  const file = path.join(ROOT, 'site.config.mjs');
  const lines = (await fs.readFile(file, 'utf8')).split('\n');
  const todos = [];
  let section = '';
  let sub = '';
  lines.forEach((line, i) => {
    const head = line.match(/^ {2}(\w+): [{[]/);
    if (head) [section, sub] = [head[1], ''];
    const subHead = line.match(/^ {4}(\w+): [{[]/);
    if (subHead) sub = subHead[1];
    const m = line.match(/\/\/\s*TODO[^:]*:?\s*(.*)$/);
    if (!m || /Listę wszystkich TODO|oznaczone „TODO”/.test(line)) return;
    const itemName = line.match(/\{ name: '([^']+)'/)?.[1];
    const key = itemName ? `„${itemName}”` : line.trim().match(/^['"]?([\w ]+?)['"]?:/)?.[1] ?? '';
    const note = m[1].trim() || (itemName ? 'cena' : 'uzupełnij');
    todos.push({ line: i + 1, where: [section, sub, key].filter(Boolean).join('.'), note });
  });
  return todos;
}

export function printTodos(todos, { compact = false } = {}) {
  if (!todos.length) {
    console.log('✔ Brak TODO w site.config.mjs');
    return;
  }
  if (compact) {
    console.log(`⚠ ${todos.length} TODO w site.config.mjs — pełna lista: npm run todo`);
    return;
  }
  console.log(`TODO w site.config.mjs (${todos.length}):\n`);
  for (const t of todos) {
    console.log(`  site.config.mjs:${String(t.line).padEnd(4)} ${t.where.padEnd(28)} ${t.note}`);
  }
  console.log('\nPolityka prywatności: fragmenty oznaczone [TODO] (src/templates/pages.mjs) są widoczne na stronie, dopóki ich nie uzupełnisz.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  printTodos(await collectTodos());
}
