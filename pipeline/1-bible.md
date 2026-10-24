# 1. Show bible

Skip if `show.md` exists.

The input is the owner's description and, if there is a `Script:` URL, the script file it points to (text and maybe images). The script is the main source; follow it closely.

Pick a short kebab-case id and write `/workspace/shows/<id>/show.md`:

- **Title** and a one-line logline.
- **Style:** one line describing the look of the whole show (e.g. "photorealistic, cinematic, shallow depth of field"). It goes into every clip, so it must not mention any place or its lighting; those belong in the place's description.
- **Language** of the dialogue. English unless the input says otherwise.
- **Characters:** for each, a kebab-case id, name, age, role in the story, and:
  - **Look:** face, hair, clothes, written so it can be used as an image prompt.
  - **Voice:** one line (e.g. "soft, low, calm female voice, speaks slowly"). This exact text is used in every clip.
- **Places:** for each, a kebab-case id and a description of only what never moves (walls, floor, windows, fixed furniture). Things the story moves, like a pot or a lantern, belong in each scene's layout. A place seen from inside and from outside is two places (`healer-hut`, `healer-hut-inside`).
- **Things:** recurring animals, creatures or props that don't look ordinary (a skeletal horse, a cursed sword), each with a kebab-case id and a description. Without a reference image the video model draws them differently in every shot.
- **Episodes:** one line each. If the input gives an `Episodes:` count, plan exactly that many; otherwise as many as the story needs. Spread the story evenly; where the script runs thin, add filler episodes with side stories and quieter moments. Episode 1 runs 2–3 minutes, the rest about one minute. Every episode ends on a hook that makes people want the next one.

Pictures in the script show how something should look: a face, an outfit, a mark on the skin, a prop. Use them when writing the descriptions. Save one as `refs/<id>.png` (and add it to `show.md` with that id) only if it shows exactly what should appear on screen. A photo of a dress worn by a stranger would put the stranger's face in the video.

Upload `{"title": "...", "description": "<logline>"}` to the app as `shows/<id>/show.json`.
