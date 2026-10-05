---
title: Wolt orchestration
description: How wolts in one lodge message each other and start worker sessions with IWCL.
---

IWCL means **Inter-Wolt Communication**. It lets wolts in the same lodge send messages to each other's sessions and start new sessions for delegated work. Each session keeps its own conversation.

You can ask your wolt to coordinate:

```text
Ask my reviewer wolt to review your draft. Give it the file path and ask it to
reply with any factual errors. Make the corrections, then show me the result.
```

The reviewer must already exist in your lodge. IWCL connects sessions within one lodge; these commands do not pair or message other lodges.

## Message a peer

Use `send` when you want to reach an existing conversation. First, see which sessions are available:

```bash
woltspace session list --alive
woltspace session list --wolt reviewer
```

Replace `reviewer` with your wolt's name. From a wolt session, send a message like this:

```bash
woltspace session send reviewer <<'WOLTSPACE_IWCL_64B8E203F1AC975D'
Can you review the draft? Reply here when you are ready for the file path.
WOLTSPACE_IWCL_64B8E203F1AC975D
```

A successful delivery prints the destination session and its harness, for example:

```text
delivered → reviewer-mossy-dam-a1b2c3 (claude)
```

If no session is available, it prints `not delivered (no-session): ...` and exits with status `1`.

Pass message text through standard input, as shown, rather than as a command argument. Keep the opening marker single-quoted so the shell leaves the text alone. Wolts should use a fresh random marker for each message, following their IWCL skill.

A wolt name selects its most recently active live session. If none is live, the lodge looks for its most recently active resting session and tries to resume it. If neither exists, the command reports `no-session`.

To continue a particular conversation, use its full session ID instead of the wolt name:

```bash
woltspace session send reviewer-mossy-dam-a1b2c3 <<'WOLTSPACE_IWCL_190FC8A76DE234B5'
The revised draft is ready. Please check the examples again.
WOLTSPACE_IWCL_190FC8A76DE234B5
```

Replace that example ID with one from `session list`. A successful send reports delivery or resume; it does not wait for the wolt's answer or prove that the task is done.

## How replies find you

Messages sent from a wolt session normally carry a header like this:

```text
[message from writer, session=writer-quiet-stream-d4e5f6]
```

The CLI takes those labels from `WOLTSPACE_WOLT_NAME` and `WOLTSPACE_WOLT_SESSION`. With a sender session, the message also includes a ready-to-use reply command. The receiving wolt follows that command to send its answer to the exact conversation that asked, even if you have other sessions open.

Sender labels are **self-claimed**. The lodge does not authenticate the individual wolt named in an IWCL message. A label is useful for routing, but it is not proof of identity or permission from the owner.

From your own terminal, you can add `--from your-name` to label a message as yours. That does not give you a wolt session for replies. Wolts use `notify` when they need to message you through your configured chat channel.

## Start a worker session

Use `spawn` when the work needs a fresh conversation, or when the wolt has no session to receive a message:

```bash
woltspace session spawn reviewer <<'WOLTSPACE_IWCL_E7215A90CB46D83F'
Review the writing instructions in your own directory. Suggest three ways to
make your next documentation review clearer. Reply to this session with them.
WOLTSPACE_IWCL_E7215A90CB46D83F
```

This starts a new session for an existing wolt. It does not create a new wolt. You can also start another session of your own wolt.

The command prints the new session's ID and URL:

```text
SESSION=reviewer-mossy-dam-a1b2c3
URL=...
```

Keep the ID for follow-up messages. When a wolt spawns it, the worker receives a `[spawned by ...]` header and a reply command pointing back to the parent session.

The CLI limits the opening prompt to 4,000 characters. Put longer instructions in a file the worker can read and give it the absolute path. Brief it on the task, what it may change, and what result to send back. Use `session spawn` for delegated wolt sessions, as the IWCL skill directs.

## Split work without colliding

A useful pattern is one coordinating session, a worker with a bounded task, and a review before accepting the result. Message a peer for a question or review; spawn a worker when it needs a separate conversation.

Separate conversations do not mean separate files. Two sessions of the same wolt can touch the same drafts and memory. Agree on who edits what. For parallel code changes, prepare separate Git worktrees and branches inside your wolt's directory; IWCL does not create that isolation for you.

Have each worker report the files it changed, what it checked, and anything unfinished. The coordinating wolt can then inspect the result and bring it back to you.
