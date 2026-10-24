# ai-video-app

A vertical micro-drama app (like ReelShort) whose shows are made by AI. Hand it a script or a short description, and episodes appear in the app, ready to review and publish.

**Grok Bot** writes and generates the videos on its own cloud computer, following the instructions in this repo. **The app** is a web app on Cloudflare (free tier) that viewers install from the browser on any phone.

## How it works

1. **New show:** in the admin page, attach the script (or type a description), optionally set how many episodes, and press Create. The bot plans the whole story as episodes (the first 2–3 minutes, the rest about one) and draws episode 1 as a storyboard: one still frame per shot.
2. **Storyboard:** leave notes on the frames and press **Send notes** to have them redrawn. When they look right, press **Make videos**: the bot animates each frame into a clip.
3. **Review:** the episode appears in admin as a draft. Leave notes pinned to a second of the episode or of a clip, or set where a clip should start and end. Then press **Send notes and cuts**: the bot fixes them and uploads a new draft.
4. **Publish**, then **Next episode**. When the script runs out, the bot continues the story itself.

The admin page wakes the bot through a webhook routine. You can also message the bot in chat: `New show: …`, `Next episode: <id>`, `Fix: <id> <epNN>`, `Make videos: <id> <epNN>`.

## Pipeline (the bot's steps)

Each step is one file in `pipeline/`. A step skips work whose output already exists, so a run can be stopped and started again.

| Step | File | Output (in `/workspace/shows/<id>/` on the bot's computer) |
|---|---|---|
| 1 | `1-bible.md` | `show.md`: characters (look + voice), places, things, style, the list of episodes |
| 2 | `2-episode.md` | `epNN/clips.md`: the episode as scenes (where everything is) and shots (first frame + action, 3–10 s, no cuts inside) |
| 3 | `3-references.md` | `refs/<id>.png`: one reference image per character, place and thing |
| 4 | `4-frames.md` | `epNN/<clip>.png`: each shot's first frame, drawn from the references; uploaded as a storyboard, then the bot stops |
| 5 | `5-clips.md` | `epNN/<clip>.mp4`: each frame animated into a 9:16 video |
| 6 | `6-publish.md` | `epNN.mp4`, cut and joined with ffmpeg, uploaded to the app as a draft |
| 7 | `7-fix.md` | for `Fix` and `Make videos`: applies the owner's notes and cuts, then reruns step 4 (and 5–6 once there are videos) |

**Consistency:** every frame is drawn from the same reference images and follows its scene's layout; every video starts from its frame. Nothing is remade without the owner asking. Each character's voice is described once in `show.md` and that exact text goes into every clip prompt.

## The app

All data is files in one R2 bucket. `worker.js` serves them (anyone can read; writing needs the admin key) and forwards admin requests to the bot's webhook.

```
shows/<id>/show.json      title, description
shows/<id>/cover.jpg
shows/<id>/epNN.json      title, status (storyboard/draft/published), trims, notes
shows/<id>/epNN.mp4       the episode
shows/<id>/epNN/<clip>.png, <clip>.mp4   each shot's first frame and video
shows/<id>/epNN/clips.md, prompts.md   what the clips were made from, for debugging
shows/<id>/show.md, refs/<id>.png      the bot's show bible and reference images
scripts/<file>            scripts uploaded from admin
```

- `/`: the viewer. Shows, then a swipe feed of published episodes.
- `/admin`: asks for the admin key once.

On a phone, open the site and use **Add to Home Screen** (iPhone) or **Install app** (Android). For the Play Store later, the same code gets wrapped with Capacitor.

## Layout

```
bot.md        the bot's standing instructions (read from GitHub every run)
pipeline/     one instruction file per step
worker.js     the backend (Cloudflare Worker)
app/          the web app: viewer (index.html, app.js), admin (admin.html, admin.js), shared.js, style.css
```

## Commands

| Command | What it does |
|---|---|
| `npm run login` | Log in to Cloudflare (once, opens the browser) |
| `npm run setup` | Create the R2 bucket (once) |
| `npm run set-key` | Set the admin key (once) |
| `npm run set-bot-url` / `npm run set-bot-key` | Set the bot's webhook URL and key (once) |
| `npm run deploy` | Publish the app |
| `npm run dev` | Run the app locally; secrets come from `.dev.vars` |
