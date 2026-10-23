# 4. Clips

For every clip in `epNN/clips.md` that has no `epNN/<clip>.mp4`, generate a video and save it there.

- **References:** `refs/<id>.png` for each id in the clip's `Refs`. They only show what people and places look like; frame the shot as the text says, not like the references.
- **Start frame:** only if the clip has `Start: <clip>`. Use the last frame of that clip's video.
- **Prompt:** the clip's text and the show's Style. Wherever a character speaks, add that character's Voice from `show.md`, word for word. End with: "One continuous shot, no cuts. Nobody looks into the camera."
- **Format:** vertical 9:16, 720p, the clip's Length, with audio.

Write the exact prompt, the reference files and the start frame you used for each clip into `epNN/prompts.md`.

Generate each clip once; never remake one on your own. Watch it from start to end, and write down any obvious problem for step 5: a body merging into the floor or furniture, a person vanishing or appearing out of nowhere, the wrong place or characters. Don't judge lip sync or where people look; you can't see those reliably. The owner decides what gets remade.
