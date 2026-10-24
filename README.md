# ai-video-app

A vertical micro-drama app (like ReelShort) whose shows are made by AI. Hand it a script or a short description, and episodes appear in the app, ready to review and publish.

Three parts, each doing what it's best at:

- **The director** is Claude (Opus), a Claude Code routine in the cloud. It writes the show bible, directs each episode as shots, writes every image and video prompt, checks the drawn frames, and turns the owner's notes into fixes. Instructions: `director.md`.
- **The Grok bot** draws and animates exactly the director's prompts, joins the clips with ffmpeg, and uploads the episode. Instructions: `bot.md`.
- **The app** is a web app on Cloudflare (free tier) that viewers install from the browser on any phone. It also stores everything, and the director and the bot work through it.

## How it works

1. **New show:** in the admin page, attach the script (or type a description), optionally set how many episodes, and press Create. The director plans the whole story (episode 1 runs 2–3 minutes, the rest about one) and directs episode 1. The Grok bot draws each shot's first frame, and the director checks them.
2. **Storyboard:** the frames appear in admin. Leave notes on them and press **Send notes** to have them redrawn. When they look right, press **Make videos**: the Grok bot animates each frame into a clip.
3. **Review:** the episode appears in admin as a draft. Leave notes pinned to a second of the episode or of a clip, or set where a clip should start and end, then press **Send notes and cuts**.
4. **Publish**, then **Next episode**. When the script runs out, the director continues the story itself.

```
admin ──task──▶ director (Claude) ──Draw / Animate──▶ Grok bot
                      ▲                                  │
                      └──────────── Frames ready ────────┘
```

Tasks to the director: `New show: …`, `Next episode: <id>`, `Fix: <id> <epNN>`, `Make videos: <id> <epNN>`, `Frames ready: <id> <epNN>`. Tasks to the Grok bot: `Draw: <id> <epNN>`, `Animate: <id> <epNN>`.

**Consistency:** every frame is drawn from the same reference images and follows its scene's layout, and every video starts from its frame. Nothing is regenerated without a reason: the director redraws a broken frame at most once, and everything else waits for the owner.

## The app

All data is files in one R2 bucket. `worker.js` serves them (anyone can read; writing needs the admin key) and forwards tasks to the director and the Grok bot.

```
shows/<id>/show.json      title, description
shows/<id>/cover.jpg
shows/<id>/show.md        the show bible: characters, places, things, episodes
shows/<id>/refs/<ref>.png one reference image per character, place and thing
shows/<id>/epNN.json      title, status (storyboard/draft/published), trims, notes
shows/<id>/epNN.mp4       the episode
shows/<id>/epNN/clips.md  the episode's scenes and shots, with every prompt
shows/<id>/epNN/<clip>.png, <clip>.mp4   each shot's first frame and video
scripts/<file>            scripts uploaded from admin
```

- `/`: the viewer. Shows, then a swipe feed of published episodes.
- `/admin`: asks for the admin key once.

On a phone, open the site and use **Add to Home Screen** (iPhone) or **Install app** (Android). For the Play Store later, the same code gets wrapped with Capacitor.

## Layout

```
director.md   the director's instructions (the Claude routine reads them from GitHub every run)
bot.md        the Grok bot's instructions (it reads them from GitHub every run)
worker.js     the backend (Cloudflare Worker)
app/          the web app: viewer (index.html, app.js), admin (admin.html, admin.js), shared.js, style.css
```

## Commands

| Command | What it does |
|---|---|
| `npm run login` | Log in to Cloudflare (once, opens the browser) |
| `npm run setup` | Create the R2 bucket (once) |
| `npm run set-key` | Set the admin key (once) |
| `npm run set-director-url` / `npm run set-director-key` | Set the director routine's fire URL and token (once) |
| `npm run set-bot-url` / `npm run set-bot-key` | Set the Grok bot's webhook URL and key (once) |
| `npm run deploy` | Publish the app |
| `npm run dev` | Run the app locally; secrets come from `.dev.vars` |
