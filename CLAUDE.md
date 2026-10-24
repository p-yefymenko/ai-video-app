# CLAUDE.md

Read `README.md` first. It explains what this project is, how the pieces fit, and the folder layout.

If you are running as the director routine, follow `director.md` and ignore the rest of this file.

## How the project works

Three parts:

- **The director's instructions** (`director.md`). Claude reads them from GitHub every run and does all the writing and judging.
- **The Grok bot's instructions** (`bot.md`). Grok reads them from GitHub every run and only draws, animates and joins.
- **The app** (`worker.js`, `app/`). A Cloudflare Worker that stores everything as files in R2, plus a web app for viewers and the admin.

Editing the instructions is writing for another AI agent: keep them short, plain, and unambiguous.

## The main rule: simplest possible, least code possible

The owner must be able to read and understand the whole project in minutes. Every change is judged by this.

- **Let the agents do it, not code.** If Claude or Grok can do something from instructions (writing, judging quality, ffmpeg work), put it in their instructions. Code is only for the app.
- **Trust the director's judgment.** Give it principles and facts about the tools, not lists of rules for edge cases. A pile of special rules means the approach is wrong.
- **Files are the state.** Shows are folders of plain files in the app's R2 bucket. No database.
- **Missing means to do.** To redo something, delete its file. No flags, no version tracking.
- **No extra structure.** Plain JavaScript, no framework, no TypeScript, no build step. The only dependency is `wrangler`. Ask before adding another.
- **Don't add files or folders** beyond the layout in `README.md` unless it can't be avoided. If one has to be added, update the README in the same change.
- **Delete before you add.** When fixing something, first see if code or text can be removed.
- **Short beats complete.** No handling for problems that haven't happened yet.

## Conventions

- Every command a person runs is a script in `package.json`.
- Show ids are kebab-case (`barista-vampire`). Episodes are `ep01`, `ep02`, …; clips are `01`, `02`, … inside an episode.
- Video is vertical 9:16.
- Keep `README.md` in sync whenever a task, file, or command changes.
