// Checks the registry files. Run by hand: node scripts/check-registry.mjs
// Nothing runs it automatically; a reviewer or a throwaway lodge can.
import fs from 'node:fs';
import path from 'node:path';
import { checkEntry, checkRanger, isReserved, LOGIN_RE, LIMITS, RANGER_FILE } from '../src/lib/profile.mjs';

const errors = [];

for (const ranger of fs.existsSync('registry') ? fs.readdirSync('registry') : []) {
  const dir = path.join('registry', ranger);
  if (!fs.statSync(dir).isDirectory()) continue;
  if (!LOGIN_RE.test(ranger)) errors.push(`${dir}: not a GitHub name`);
  else if (isReserved(ranger)) errors.push(`${dir}: "${ranger}" is the name of a site page; it cannot be a ranger`);
  const files = fs.readdirSync(dir);
  if (files.filter((f) => f.endsWith('.json') && f !== `${RANGER_FILE}.json`).length > LIMITS.seedsPerRanger) errors.push(`${dir}: at most ${LIMITS.seedsPerRanger} seeds per ranger`);
  for (const file of files) {
    const where = path.join(dir, file);
    if (!file.endsWith('.json')) { errors.push(`${where}: only .json files belong here`); continue; }
    let raw;
    try { raw = JSON.parse(fs.readFileSync(where, 'utf8')); } catch { errors.push(`${where}: not valid JSON`); continue; }
    const check = file === `${RANGER_FILE}.json` ? checkRanger(raw) : checkEntry(raw, ranger, file.slice(0, -5));
    for (const error of check.errors) errors.push(`${where}: ${error}`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('registry ok');
