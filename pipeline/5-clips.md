# 5. Clips

For every clip in `epNN/clips.md` that has no `epNN/<clip>.mp4`, generate a video and save it there.

- **Start image:** `epNN/<clip>.png`. It becomes the first frame.
- **References:** `refs/<id>.png` for each id in the clip's `Refs`, to keep faces and places the same as the video moves.
- **Prompt:** the clip's Action and the show's Style. Wherever a character speaks, add that character's Voice from `show.md`, word for word. End with: "One continuous shot, no cuts. Nobody looks into the camera."
- **Format:** vertical 9:16, 720p, the clip's Length, with audio.

Add the exact prompt and the files you used for each clip to `epNN/prompts.md`.

Generate each clip once; never remake one on your own. The owner reviews them.
