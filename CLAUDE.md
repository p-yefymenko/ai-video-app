# CLAUDE.md

Read `README.md` first. It explains what this project is, how the pieces fit, and the folder layout.

## How the project works

Two halves:

- **The bot's instructions** (`bot.md`, `pipeline/`). Grok Bot reads them from GitHub every run and does the writing and video work. Editing them is writing for another AI agent: keep them short, plain, and unambiguous.
- **The app** (`worker.js`, `app/`). A Cloudflare Worker that stores everything as files in R2, plus a web app for viewers and the admin.

## The main rule: simplest possible, least code possible

The owner must be able to read and understand the whole project in minutes. Every change is judged by this.

- **Let the bot do it, not code.** If Grok Bot can do something from instructions (writing, judging quality, ffmpeg work), put it in `pipeline/`. Code is only for the app.
- **Files are the state.** Shows are folders of plain files: on the bot's computer while being made, and in R2 for the app. No database.
- **A step skips what already exists.** To redo something, delete its file and run again. No flags, no version tracking.
- **No extra structure.** Plain JavaScript, no framework, no TypeScript, no build step. The only dependency is `wrangler`. Ask before adding another.
- **Don't add files or folders** beyond the layout in `README.md` unless it can't be avoided. If one has to be added, update the README in the same change.
- **Delete before you add.** When fixing something, first see if code or text can be removed.
- **Short beats complete.** No handling for problems that haven't happened yet.

## Conventions

- Every command a person runs is a script in `package.json`.
- Show ids are kebab-case (`barista-vampire`). Episodes are `ep01`, `ep02`, …; shots are `01`, `02`, … inside an episode.
- Video is vertical 9:16.
- Keep `README.md` in sync whenever a step, file, or command changes.
