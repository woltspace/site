---
title: Scheduling
description: The wolf runs the jobs. Digests, reviews, reminders.
---

The wolf is the lodge's scheduler. Give a wolt a task and a time, and the wolf starts a new session for that wolt when it is due. Use it for a daily digest, a weekly review, or a one-time reminder.

Your lodge must be running and its machine awake for scheduled work to start. If a laptop sleeps through a recurring run at 09:00 and wakes at 09:20, that run is skipped. Catch-up happens when the wolf starts, not whenever the machine wakes.

Open **wolves** in the lodge navigation to see your schedules and edit them in place.

## Ask your wolt

You can ask in plain words:

```text
Every weekday at 9am, summarize your recent work and save it in your drafts.
Use the lodge's local time. Call the schedule daily-digest.
```

Wolts have a `woltspace-wolf` skill for setting this up. Ask yours to show the saved schedule and its next run so you can check the time.

## Add a schedule yourself

With the lodge running, use `woltspace wolf`. Replace `mywolt` with an existing wolt's name:

```bash
woltspace wolf add --wolt mywolt --name daily-digest --cron '0 9 * * 1-5' <<'WOLF_MSG'
Summarize your recent work and save it in wolt/drafts/daily-digest.md.
WOLF_MSG
```

The text between the markers becomes the new session's prompt. Include enough detail for a fresh session to do the work. Inside a wolt session, `--wolt` defaults to that wolt; in your own terminal, supply it explicitly.

Add `--dry-run` to check an entry before saving it. The CLI asks the lodge to validate the schedule and message before writing them.

### Choose the time

Times follow **the machine running the lodge**, which may differ from your phone or laptop. There is no per-schedule time zone. `woltspace wolf list` shows the lodge's zone when there are schedules. For an empty list, use `woltspace wolf list --json` to see the zone.

A recurring schedule has five fields:

```text
minute hour day-of-month month day-of-week
```

| Expression | When it runs |
|---|---|
| `0 9 * * *` | Every day at 09:00 |
| `0 9 * * 1-5` | Weekdays at 09:00 |
| `0 16 * * 5` | Fridays at 16:00, useful for a weekly review |
| `*/15 * * * *` | Every 15 minutes |

Use numbers, not names such as `MON`. Sunday is `0` or `7`. Lists (`1,3,5`), ranges (`1-5`), and steps (`*/15`) work.

If you specify both a day of the month and a day of the week, **both must match**. For example, `0 9 13 * 5` means Friday the 13th at 09:00. This differs from classic cron.

## Run once at a chosen time

Use `--at` instead of `--cron`. Replace the example date with a future date and time on the lodge's clock:

```bash
woltspace wolf add --wolt mywolt --name reminder --at 2026-12-01T14:30 --notify telegram <<'WOLF_MSG'
Remind me to prepare my notes for tomorrow's meeting.
WOLF_MSG
```

The wolf removes the one-off entry after trying to start its session. That does not mean the task has finished successfully; open the session to check its result.

### Notifications

`--notify telegram` or `--notify slack` requests a wake-up message with a session link when available. The channel must already be configured; Slack also needs `SLACK_NOTIFY_CHANNEL`. Leave `--notify` out to skip the routine wake-up ping.

This ping announces that the wolt woke up. If you want the finished work sent to you too, say so in the task's prompt.

## Check, change, or remove a schedule

```bash
woltspace wolf list --wolt mywolt
woltspace wolf set mywolt daily-digest --cron '30 8 * * 1-5'
woltspace wolf run mywolt daily-digest
woltspace wolf runs --wolt mywolt --limit 10
woltspace wolf rm mywolt daily-digest
```

`list` shows next and last scheduled runs. `set` changes the saved entry. `run` starts an extra session immediately without changing the schedule or its last-run stamp. Even a one-off stays scheduled after a manual run. Manual runs do not send the scheduler's wake-up ping.

`runs` shows recent scheduler events, not proof that the wolt completed its task. `rm` removes the saved schedule. Names are unique within each wolt, so two wolts can both have a `daily-digest`.

## Where schedules live

Each wolt owns a `wolt/wolf.json` file inside its directory. The CLI edits it for you. A minimal file looks like this:

```json
{
  "crons": [
    {
      "name": "weekly-review",
      "schedule": "0 16 * * 5",
      "prompt": "Review this week's work and save a short summary in wolt/drafts/weekly-review.md.",
      "catch_up": false
    }
  ]
}
```

Every entry needs a `name`, a `prompt`, and exactly one of `schedule` or `at`. Names use letters, digits, hyphens, or underscores. Optional `notify` selects `telegram` or `slack`.

The wolf checks the files about every 30 seconds. Hand edits are picked up without a restart, but use the CLI when possible to catch mistakes before saving.

When the wolf starts, it checks for each recurring schedule's most recent missed run within the last 24 hours and runs it once. Set `"catch_up": false` on that entry to skip this startup catch-up. Overdue one-offs still run when the wolf next checks them.
