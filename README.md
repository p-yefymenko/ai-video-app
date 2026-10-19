# ai-video-app

Describe a show in plain words and get its first episode as a finished vertical video. Ask for more episodes whenever you want.

This replaces the content pipeline from `ai-slop-video-app`, which used local models and a lot of code. Here **Grok Bot does everything**: it writes, generates the video, and edits, on its own cloud computer. This repo holds only its instructions, as plain markdown.

## Usage

Message the bot from the Grok Bot app (desktop or phone):

```
New show: a K-drama about a barista who is secretly a vampire
Next episode: barista-vampire
```

The finished episode appears in Google Drive: `ai-video-app/barista-vampire/ep01.mp4`

## Pipeline

Each step is one file in `pipeline/`. A step skips work whose output already exists, so a run can be stopped and started again.

| Step | File | Output (in `/workspace/shows/<id>/` on the bot's computer) |
|---|---|---|
| 1 | `1-bible.md` | `show.md`: premise, characters (look + voice), places, visual style, season plan |
| 2 | `2-episode.md` | `epNN/shots.md`: the episode as a list of shots (up to 15 s each) with dialogue |
| 3 | `3-references.md` | `refs/<id>.png`: one reference image per character and place that doesn't have one yet |
| 4 | `4-clips.md` | `epNN/<shot>.mp4`: one 9:16 clip per shot, made from the shot's reference images |
| 5 | `5-edit.md` | `epNN.mp4` joined with ffmpeg, then uploaded to Google Drive |

Every run goes through all 5 steps; finished ones are skipped. So `Next episode` also resumes an episode that stopped halfway.

**Consistency:** every clip gets the same reference images (faces, clothes, places), with no start frames. The video tool has no voice control, so each character's voice is described once in `show.md` and that exact text goes into every clip prompt. Expect small drift in both.

## Layout

```
bot.md      instructions pasted once into the Grok Bot's settings
pipeline/   one instruction file per step
```

## Setup (once)

1. Create a Grok Bot and paste `bot.md` into its instructions.
2. Connect GitHub (so it can read this repo) and Google Drive.
