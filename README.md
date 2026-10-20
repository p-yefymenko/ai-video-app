# ai-video-app

A vertical micro-drama app (like ReelShort) whose shows are made by AI. Hand it a script or a short description, and episodes appear in the app, ready to review and publish.

**Grok Bot** writes and generates the videos on its own cloud computer, following the instructions in this repo. **The app** is a web app on Cloudflare (free tier) that viewers install from the browser on any phone.

## How it works

1. **New show:** in the admin page, attach the script (or type a description) and press Create. The bot plans the whole story as one-minute episodes and makes episode 1.
2. **Review:** the episode appears in admin as a draft. Leave notes pinned to a second of the episode or of a clip, or set where a clip should start and end. Then press **Send notes and cuts to the bot**: it fixes them and uploads a new draft.
3. **Publish**, then **Next episode**. When the script runs out, the bot continues the story itself.

The admin page wakes the bot through a webhook routine. You can also message the bot in chat: `New show: …`, `Next episode: <id>`, `Fix: <id> <epNN>`.

## Pipeline (the bot's steps)

Each step is one file in `pipeline/`. A step skips work whose output already exists, so a run can be stopped and started again.

| Step | File | Output (in `/workspace/shows/<id>/` on the bot's computer) |
|---|---|---|
| 1 | `1-bible.md` | `show.md`: characters (look + voice), places, style, the list of episodes |
| 2 | `2-episode.md` | `epNN/clips.md`: the episode, directed as a list of clips (one generation each, up to 15 s, cuts allowed) |
| 3 | `3-references.md` | `refs/<id>.png`: one reference image per character and place |
| 4 | `4-clips.md` | `epNN/<clip>.mp4`: one 9:16 video per clip, made from the reference images |
| 5 | `5-publish.md` | `epNN.mp4`, cut and joined with ffmpeg, uploaded to the app as a draft |
| 6 | `6-fix.md` | only for `Fix`: applies the owner's notes and cuts, then reruns steps 4–5 |

**Consistency:** every clip gets the same reference images, with no start frames. Each character's voice is described once in `show.md` and that exact text goes into every clip prompt.

## The app

All data is files in one R2 bucket. `worker.js` serves them (anyone can read; writing needs the admin key) and forwards admin requests to the bot's webhook.

```
shows/<id>/show.json      title, description
shows/<id>/cover.jpg
shows/<id>/epNN.json      title, status (draft/published), trims, notes
shows/<id>/epNN.mp4       the episode
shows/<id>/epNN/<clip>.mp4
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
