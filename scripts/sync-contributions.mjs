// Writes src/data/contributions.json: every merged pull request in the
// Woltspace repos, and who owns the GitHub App bots that opened some of them.
// The site build reads only that file, so run this by hand (or from a job that
// opens a pull request) and review the diff like any other change:
//
//   GITHUB_TOKEN=... node scripts/sync-contributions.mjs
//
// A token is optional but GitHub allows only 60 requests an hour without one.
import fs from 'node:fs';

const ORGS = ['woltspace'];                                        // every public repo of these
const REPOS = ['jerpint/woltspace', 'jerpint/woltspace-starter-lodge']; // and these
// Not counted: this site (its pull requests are mostly registry files and page
// edits, and joining as a ranger is itself a pull request here).
const SKIP = ['woltspace/site'];
const OUT = 'src/data/contributions.json';
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

// Any error stops the run before the file is written: a rate limit (403/429) or
// a missing repo must never turn into a shorter list that drops someone's credit.
// Only an app's owner may be missing (404: a private app), see below.
async function get(path, { missing = false } = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'woltspace-site', ...(token ? { authorization: `Bearer ${token}` } : {}) },
  });
  if (missing && res.status === 404) return null;
  if (!res.ok) throw new Error(`${path}: GitHub said ${res.status}, nothing written`);
  return res.json();
}
async function pages(path) {
  const out = [];
  for (let page = 1; ; page++) {
    const batch = await get(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error(`${path}: not a list, nothing written`);
    if (!batch.length) return out;
    out.push(...batch);
    if (batch.length < 100) return out;
  }
}

const repos = new Set(REPOS);
for (const org of ORGS) for (const r of await pages(`orgs/${org}/repos?type=public`)) if (!r.fork) repos.add(r.full_name); // archived repos still count
for (const r of SKIP) repos.delete(r);

const prs = [];
for (const repo of [...repos].sort()) {
  const closed = await pages(`repos/${repo}/pulls?state=closed`);
  for (const pr of closed) {
    if (!pr.merged_at || !pr.user) continue;
    const bot = pr.user.type === 'Bot';
    if (!bot && pr.user.type !== 'User') continue;
    prs.push({ repo, number: pr.number, title: pr.title.slice(0, 120), merged: pr.merged_at.slice(0, 10), author: bot ? pr.user.login.replace(/\[bot\]$/, '') : pr.user.login, ...(bot ? { bot: true } : {}) });
  }
  console.log(`${repo}: ${closed.filter((pr) => pr.merged_at).length} merged`);
}
prs.sort((a, b) => b.merged.localeCompare(a.merged) || a.repo.localeCompare(b.repo) || b.number - a.number);

// Who owns each bot, as GitHub says today. A ranger's own ranger.json can claim
// a bot only when this matches. A private app has no public owner (null): a
// maintainer links it in src/data/rangers.json instead. Nothing is carried over
// from an earlier run, so a transferred app stops counting for its old owner.
const owners = {};
for (const slug of [...new Set(prs.filter((pr) => pr.bot).map((pr) => pr.author))].sort()) {
  const app = await get(`apps/${slug}`, { missing: true });
  owners[slug] = app?.owner?.login ?? null;
  console.log(`bot ${slug}: ${owners[slug] ? `owned by ${owners[slug]}` : 'owner not public'}`);
}

fs.writeFileSync(OUT, JSON.stringify({ synced: new Date().toISOString().slice(0, 10), repos: [...repos].sort(), owners, prs }, null, 1) + '\n');
console.log(`${OUT}: ${prs.length} merged pull requests`);
