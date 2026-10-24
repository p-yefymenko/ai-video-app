# 6. Publish

Skip if `epNN.mp4` exists.

Download `shows/<id>/epNN.json` from the app, if it exists. Its `trims` say where the owner wants each clip cut, in seconds: `{"03": {"start": 0.5, "end": 6.2}}`. A missing start or end means no cut there.

With ffmpeg, cut each clip by its trims and join them in order into `epNN.mp4`. Re-encode (H.264 and AAC) so the cuts are exact.

Upload to the app:

- delete the app's `shows/<id>/epNN/` folder first, so nothing old is left; then every clip and frame as `shows/<id>/epNN/<clip>.mp4` and `<clip>.png`, and `epNN/clips.md` and `epNN/prompts.md` next to them
- `show.md` and every reference image as `shows/<id>/show.md` and `shows/<id>/refs/<id>.png`, so the owner can see what the clips were made from
- `epNN.mp4` as `shows/<id>/epNN.mp4`
- if the show has no `shows/<id>/cover.jpg` yet: a striking vertical frame from this episode
- `shows/<id>/epNN.json`: the app's copy, with `status` set to `draft` if it was `storyboard`

The episode is now a draft in the app's admin page. The owner publishes it.
