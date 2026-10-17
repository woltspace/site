# Share a wolt or an app

This folder is the list of seeds shared on woltspace.com. A seed is a public
GitHub repo made with `woltspace seed create`: it holds one or more wolts, and
the apps they keep.

Your **ranger** name is your GitHub name. There is no sign-up.

## How

1. Make your seed and push it to a public repo you own, for example
   `github.com/you/my-seed`. Its README is what a chat reads when someone
   presses "Open in Claude" on your wolt's page, so end it with a section
   titled "If you're an AI assistant reading this": one line on what
   Woltspace is, and for each wolt, the file to read to become it (see
   [jerpint/woltspace-starter-lodge](https://github.com/jerpint/woltspace-starter-lodge)).
2. Open a pull request that adds one file, `registry/you/my-seed.json`. Copy
   the fields from your seed's `wolts/<name>/wolt.json`. Your wolt can write it
   for you.

   ```json
   {
     "repo": "you/my-seed",
     "wolts": [
       {
         "name": "scribe",
         "type": "otter",
         "role": "Note taker",
         "description": "Keeps your notes tidy and finds them again.",
         "skills": ["scribe-notes"]
       }
     ],
     "apps": []
   }
   ```

3. Once it is merged you get:

   - `woltspace.com/you/<wolt>` for every wolt in the file
   - `woltspace.com/dam/you/<app>` for every app in the file
   - `woltspace.com/you`, your ranger page

What is in the file is exactly what the page shows. Nothing is read from your
repo when the site builds, and nothing from it is ever run. (Visitors' browsers
ask GitHub for its star count.) To change a page, change the file in a new pull request.

## Become a ranger

There are three ways in:

- **Share a seed**, as above.
- **Help build Woltspace.** Once you have a merged pull request in a Woltspace repo
  (`jerpint/woltspace`, or any repo of the `woltspace` org), you get a ranger page
  that thanks you and lists your contributions. You don't need to do anything.
- **Just ask.** Open a pull request that adds one file, `registry/you/ranger.json`:

  ```json
  { "hello": "I wanna become a ranger" }
  ```

`ranger.json` takes three optional keys:

- `"hello"`: one line for your page, up to 140 characters.
- `"bots"`: your own GitHub App bots, e.g. `["my-lodge"]`, when your wolts open
  pull requests through one. Their merged pull requests count as yours,
  but only if GitHub lists you as the app's owner.
- `"listed": false`: takes your ranger page off the site. You can also ask Woltspace to hide it.

Contributions come from `src/data/contributions.json`. Woltspace refreshes that file
with `node scripts/sync-contributions.mjs` and merges it like any other change, so a
new contribution shows up after the next refresh. Pull requests opened by a bot no
ranger has linked count for nobody. Because of the file name, a seed repo can't be called `ranger`.

## Rules

- You can only add or change files under `registry/<your GitHub name>/`. The
  folder, the repo owner and the pull request author must be the same GitHub
  account.
- The "For agents" part of a wolt page points a chat at your repo, so what a
  chat reads there can change at any time. That is why the page warns.
- Limits: 10 seeds per ranger, 25 wolts and 25 apps per file, short text fields.
- Every shared wolt and app is shown as **third party**, with a yellow mark,
  unless its ranger is verified.
- Badges, verified rangers, bots whose owner GitHub doesn't show, and hidden rangers
  (`src/data/rangers.json`) are set by Woltspace.
- Names of site pages (docs, wolts, dam, rangers, blog...) cannot be rangers.
- To take something down, remove it from your file, or the file, in a pull
  request. Woltspace can remove any entry.

## Reviewing a pull request

Nothing checks a pull request automatically. Before merging:

1. The pull request changes **one file**, `registry/<name>/<repo>.json` or `registry/<name>/ranger.json`.
2. `<name>` is the pull request author, and the `"repo"` line starts with it.
3. Read the file. Its text is what the page will show.

Optional: `node scripts/check-registry.mjs` says if a field is wrong or too long.
