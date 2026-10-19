# CLAUDE.md

Read `README.md` first. It explains what this project is, the pipeline, and the folder layout.

## How the project works

Grok Bot runs the pipeline on its own cloud computer. This repo is only its instructions. When you edit this repo, you are writing instructions for another AI agent: keep them short, plain, and unambiguous.

## The main rule: simplest possible, least code possible

The owner must be able to read and understand the whole project in minutes. Every change is judged by this.

- **Instructions, not code.** Every step is a markdown file the bot follows. The only command anywhere is the ffmpeg line in `pipeline/5-edit.md`. Ask before adding any code.
- **Files are the state.** A show is a folder of plain files on the bot's computer (`.md`, `.png`, `.mp4`). No database, no server, no config.
- **A step skips what already exists.** To redo something, delete its file and run again. No flags, no version tracking.
- **Don't add files or folders** beyond the layout in `README.md` unless it can't be avoided. If one has to be added, update the README in the same change.
- **Delete before you add.** When fixing something, first see if text can be removed.
- **Short beats complete.** No handling for problems that haven't happened yet.

## Conventions

- Show ids are kebab-case (`barista-vampire`). Episodes are `ep01`, `ep02`, …; shots are `01`, `02`, … inside an episode.
- Video is vertical 9:16.
- Keep `README.md` in sync whenever a step or file changes.
