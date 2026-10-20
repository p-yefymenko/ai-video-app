# 1. Show bible

Skip if `show.md` exists.

The input is the owner's description and, if there is a `Script:` URL, the script file it points to (text and maybe images). The script is the main source; follow it closely.

Pick a short kebab-case id and write `/workspace/shows/<id>/show.md`:

- **Title** and a one-line logline.
- **Style:** one line describing the look of every shot (e.g. "photorealistic, cinematic, warm night lighting").
- **Language** of the dialogue. English unless the input says otherwise.
- **Characters:** for each, a kebab-case id, name, age, role in the story, and:
  - **Look:** face, hair, clothes, written so it can be used as an image prompt.
  - **Voice:** one line (e.g. "soft, low, calm female voice, speaks slowly"). This exact text is used in every clip.
- **Places:** for each, a kebab-case id and a description with 2–3 fixed details that make it recognizable.
- **Episodes:** the whole story as one-minute episodes, one line each, as many as it needs. Without a script, plan 10. Every episode ends on a hook that makes people want the next one.

If the script has a picture of a character or place, save it as `refs/<id>.png`.

Upload `{"title": "...", "description": "<logline>"}` to the app as `shows/<id>/show.json`.
