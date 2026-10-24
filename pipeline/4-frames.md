# 4. Frames

For every clip in `epNN/clips.md` that has no `epNN/<clip>.png`, generate its first frame with the image tool and save it there.

- **References:** `refs/<id>.png` for each id in the clip's `Refs`, plus the scene's first frame if this isn't it, so the place and props stay the same.
- **Prompt:** the clip's Frame, the scene's Layout, and the show's Style. Vertical 9:16, no text.

Write the exact prompt and the reference files you used for each frame into `epNN/prompts.md`.

Generate each frame once; never remake one on your own. The owner reviews them.

Upload to the app: every frame as `shows/<id>/epNN/<clip>.png`, `epNN/clips.md` and `epNN/prompts.md` next to them, `show.md` and every reference image as `shows/<id>/show.md` and `shows/<id>/refs/<id>.png`. If the app has no `shows/<id>/epNN.json` yet, upload `{"title": "<episode title>", "status": "storyboard", "trims": {}, "notes": []}`.

The storyboard is now in the app's admin page. Stop here: the owner reviews it and sends notes or **Make videos**.
