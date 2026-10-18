// Shared wolts and apps. Each registry/<ranger>/<repo>.json holds the profiles
// of the wolts and apps shown from that seed, exactly as merged. The build
// reads only those files: an edit in someone's repo changes nothing here until
// a pull request brings it in. Nothing is fetched at build time (stars are
// filled in by the visitor's browser, see components/Stars.astro).
//
// Rangers are also the people who helped build Woltspace: anyone with a merged
// pull request in src/data/contributions.json (written by
// scripts/sync-contributions.mjs) gets a page that thanks them, unless they opt
// out. A PR opened by a ranger's own GitHub App bot counts for that ranger.
import fs from 'node:fs';
import path from 'node:path';
import rangerExtras from '../data/rangers.json';
import contributionData from '../data/contributions.json';
import { checkEntry, checkRanger, isReserved, LOGIN_RE, RESERVED, REPO_RE, NAME_RE, LIMITS, RANGER_FILE } from './profile.mjs';

const REGISTRY_DIR = path.resolve(process.env.REGISTRY_DIR || 'registry');
const EMOJI: Record<string, string> = { otter: '🦦', beaver: '🦫', raccoon: '🦝', wolf: '🐺', dog: '🐶' };

export interface Ranger { login: string; badge: string | null; verified: boolean; hello: string; wolts: Wolt[]; apps: App[]; contributions: Contribution[]; search: string }
export interface Contribution { repo: string; number: number; title: string; merged: string; url: string; via: string | null }
export interface Seed { ranger: string; repo: string; url: string; gitUrl: string }
export interface Wolt {
  ranger: string; name: string; title: string; type: string; emoji: string; role: string; description: string;
  skills: string[]; seed: Seed; verified: boolean; identityUrl: string; treeUrl: string; siblings: string[]; apps: string[];
}
export interface App {
  ranger: string; name: string; emoji: string; description: string; stack: string; start: string;
  keeper: string; distribution: string; sourceUrl: string; seed: Seed; verified: boolean;
}
export interface Share { rangers: Ranger[]; wolts: Wolt[]; apps: App[]; live: Live }
// What /rangers needs to redo the credit in the visitor's browser: one search for
// every merged pull request, and who gets each one (lowercase logins).
export interface Live { search: string; alias: Record<string, string>; bots: Record<string, string>; skip: string[]; reserved: string[]; login: string }

// Set by Woltspace in src/data/rangers.json: badges, verified, bots whose owner
// GitHub does not show (linked by hand), other accounts of the same person, hidden.
interface Extra { badge?: string; verified?: boolean; bots?: string[]; accounts?: string[]; hidden?: boolean }
const extras = Object.fromEntries(Object.entries(rangerExtras as Record<string, Extra>).map(([k, v]) => [k.toLowerCase(), v]));
const extraOf = (login: string): Extra => extras[login.toLowerCase()] ?? {};

// Where things live: woltspace.com/<ranger> and woltspace.com/<ranger>/<wolt>.
export const rangerPath = (ranger: string) => `/${ranger}`;
export const woltPath = (ranger: string, wolt: string) => `/${ranger}/${wolt}`;

const title = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

function registryFiles(): { ranger: string; repo: string; raw: unknown }[] {
  if (!fs.existsSync(REGISTRY_DIR)) return [];
  const out = [];
  for (const ranger of fs.readdirSync(REGISTRY_DIR).sort()) {
    const dir = path.join(REGISTRY_DIR, ranger);
    if (!LOGIN_RE.test(ranger) || isReserved(ranger) || !fs.statSync(dir).isDirectory()) continue;
    const repos = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter((r) => REPO_RE.test(r) && r !== RANGER_FILE).sort();
    for (const repo of repos.slice(0, LIMITS.seedsPerRanger)) {
      try { out.push({ ranger, repo, raw: JSON.parse(fs.readFileSync(path.join(dir, `${repo}.json`), 'utf8')) }); }
      catch { console.warn(`registry: ${ranger}/${repo}.json is not valid JSON, skipped`); }
    }
  }
  return out;
}

// registry/<ranger>/ranger.json, for each ranger that has one.
function rangerFiles(): Map<string, { login: string; hello: string; bots: string[]; listed: boolean }> {
  const out = new Map();
  if (!fs.existsSync(REGISTRY_DIR)) return out;
  for (const login of fs.readdirSync(REGISTRY_DIR).sort()) {
    const file = path.join(REGISTRY_DIR, login, `${RANGER_FILE}.json`);
    if (!LOGIN_RE.test(login) || isReserved(login) || !fs.existsSync(file)) continue;
    let raw;
    try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { console.warn(`registry: ${login}/${RANGER_FILE}.json is not valid JSON, skipped`); continue; }
    const { entry, errors } = checkRanger(raw);
    for (const error of errors) console.warn(`registry: ${login}/${RANGER_FILE}.json: ${error}`);
    out.set(login.toLowerCase(), { login, ...entry });
  }
  return out;
}

// Who gets the credit for each merged pull request: its human author (or the
// ranger who listed that account), or the ranger whose bot opened it.
function contributionsByRanger(files: ReturnType<typeof rangerFiles>): { byRanger: Map<string, { login: string; list: Contribution[] }>; botOwner: Map<string, string>; alias: Map<string, string>; repos: string[] } {
  const data = contributionData as { repos: string[]; owners: Record<string, string | null>; prs: { repo: string; number: number; title: string; merged: string; author: string; bot?: boolean }[] };
  const alias = new Map<string, string>();
  const botOwner = new Map<string, string>();
  for (const [login, extra] of Object.entries(extras)) {
    for (const account of extra.accounts ?? []) alias.set(account.toLowerCase(), login);
    for (const bot of extra.bots ?? []) botOwner.set(bot.toLowerCase(), login);
  }
  for (const [key, file] of files) for (const bot of file.bots) {
    if (botOwner.has(bot)) continue;
    if ((data.owners[bot] ?? '').toLowerCase() === key) botOwner.set(bot, key);
    else console.warn(`registry: ${file.login} lists bot ${bot}, but GitHub does not say they own it; not counted`);
  }
  const out = new Map<string, { login: string; list: Contribution[] }>();
  for (const pr of data.prs) {
    const author = pr.author.toLowerCase();
    const key = pr.bot ? botOwner.get(author) : (alias.get(author) ?? author);
    if (!key) continue;
    const login = pr.bot || alias.has(author) ? (files.get(key)?.login ?? key) : pr.author;
    if (!LOGIN_RE.test(login) || isReserved(login)) continue;
    if (!out.has(key)) out.set(key, { login, list: [] });
    out.get(key)!.list.push({ repo: pr.repo, number: pr.number, title: pr.title, merged: pr.merged, url: `https://github.com/${pr.repo}/pull/${pr.number}`, via: pr.bot ? `${pr.author}[bot]` : null });
  }
  return { byRanger: out, botOwner, alias, repos: data.repos };
}

// The GitHub search a ranger page runs in the visitor's browser to show fresh
// numbers: the same repos and the same accounts and bots as the saved file.
function searchFor(key: string, login: string, credit: ReturnType<typeof contributionsByRanger>): string {
  const authors = [login, ...[...credit.alias].filter(([, k]) => k === key).map(([a]) => a)].map((a) => `author:${a}`);
  const bots = [...credit.botOwner].filter(([, k]) => k === key).map(([b]) => `author:app/${b}`);
  return ['is:pr', 'is:merged', ...authors, ...bots, ...credit.repos.map((r) => `repo:${r}`)].join(' ');
}

async function load(): Promise<Share> {
  const rangers = new Map<string, Ranger>();
  const files = rangerFiles();
  const newRanger = (login: string): Ranger => {
    const extra = extraOf(login);
    return { login, badge: extra.badge ?? null, verified: extra.verified === true, hello: files.get(login.toLowerCase())?.hello ?? '', wolts: [], apps: [], contributions: [], search: '' };
  };

  for (const { ranger, repo, raw } of registryFiles()) {
    const { entry: data, errors } = checkEntry(raw, ranger, repo);
    for (const error of errors) console.warn(`registry: ${ranger}/${repo}: ${error}`);
    if (!data.repo) continue;
    const key = ranger.toLowerCase();
    if (!rangers.has(key)) rangers.set(key, newRanger(ranger));
    const entry = rangers.get(key)!;
    const url = `https://github.com/${ranger}/${repo}`;
    const seed: Seed = { ranger, repo, url, gitUrl: `${url}.git` };
    const woltData = (data.wolts ?? []).filter((w: any) => NAME_RE.test(w?.name ?? ''));
    const appData = (data.apps ?? []).filter((a: any) => NAME_RE.test(a?.name ?? ''));
    const woltNames: string[] = woltData.map((w: any) => w.name);
    const appNames: string[] = appData.map((a: any) => a.name);

    // A ranger's names are unique across their seeds: first seed (by repo name) wins.
    for (const w of woltData) {
      if (entry.wolts.some((existing) => existing.name === w.name)) continue;
      entry.wolts.push({
        ranger, name: w.name, title: title(w.name), type: w.type ?? '', emoji: EMOJI[w.type] ?? '',
        role: w.role ?? '', description: w.description ?? '', skills: w.skills ?? [], seed, verified: entry.verified,
        identityUrl: `https://raw.githubusercontent.com/${ranger}/${repo}/HEAD/wolts/${w.name}/identity.md`,
        treeUrl: `${url}/tree/HEAD/wolts/${w.name}`,
        siblings: woltNames.filter((n) => n !== w.name), apps: appNames,
      });
    }
    for (const a of appData) {
      if (entry.apps.some((existing) => existing.name === a.name)) continue;
      entry.apps.push({
        ranger, name: a.name, emoji: a.emoji ?? '', description: a.description ?? '', stack: a.stack ?? '', start: a.start ?? '',
        keeper: a.keeper ?? '', distribution: a.distribution ?? 'bundled',
        sourceUrl: typeof a.sourceUrl === 'string' && a.sourceUrl.startsWith('https://') ? a.sourceUrl : url,
        seed, verified: entry.verified,
      });
    }
  }

  const credit = contributionsByRanger(files);
  for (const [key, { login, list }] of credit.byRanger) {
    if (!rangers.has(key)) rangers.set(key, newRanger(login));
    rangers.get(key)!.contributions = list;
  }
  for (const [key, file] of files) if (!rangers.has(key)) rangers.set(key, newRanger(file.login));
  for (const [key, r] of rangers) r.search = searchFor(key, r.login, credit);

  const all = [...rangers.entries()]
    .filter(([key, r]) => files.get(key)?.listed !== false && !extraOf(r.login).hidden)
    .map(([, r]) => r)
    .sort((a, b) => a.login.toLowerCase().localeCompare(b.login.toLowerCase()));
  const wolts = all.flatMap((r) => r.wolts);
  const live: Live = {
    search: ['is:pr', 'is:merged', ...credit.repos.map((r) => `repo:${r}`)].join(' '),
    alias: Object.fromEntries(credit.alias), bots: Object.fromEntries(credit.botOwner),
    reserved: RESERVED, login: LOGIN_RE.source,
    skip: [...new Set([...[...files].filter(([, f]) => !f.listed).map(([k]) => k), ...Object.entries(extras).filter(([, e]) => e.hidden).map(([k]) => k)])],
  };
  return { rangers: all, wolts, apps: all.flatMap((r) => r.apps), live };
}

// Who a GitHub name is here: badge, verified, and whether they have a ranger page.
// Works for anyone, including someone who has shared nothing yet.
export async function rangerOf(login: string): Promise<{ login: string; badge: string | null; verified: boolean; hasPage: boolean }> {
  const { rangers } = await loadShare();
  const found = rangers.find((r) => r.login.toLowerCase() === login.toLowerCase());
  const extra = extraOf(login);
  return { login: found?.login ?? login, badge: extra.badge ?? null, verified: extra.verified === true, hasPage: Boolean(found) };
}

let cached: Promise<Share> | null = null;
export function loadShare(): Promise<Share> {
  return (cached ??= load());
}
