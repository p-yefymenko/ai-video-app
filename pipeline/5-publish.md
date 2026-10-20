# 5. Publish

Skip if `epNN.mp4` exists.

Download `shows/<id>/epNN.json` from the app, if it exists. Its `trims` say where the owner wants each clip cut, in seconds: `{"03": {"start": 0.5, "end": 6.2}}`. A missing start or end means no cut there.

With ffmpeg, cut each clip by its trims and join them in order into `epNN.mp4`. Re-encode (H.264 and AAC) so the cuts are exact.

Upload to the app:

- every clip as `shows/<id>/epNN/<clip>.mp4`
- `epNN.mp4` as `shows/<id>/epNN.mp4`
- if the show has no `shows/<id>/cover.jpg` yet: a striking vertical frame from this episode
- if `epNN.json` didn't exist: `{"title": "<episode title>", "status": "draft", "trims": {}, "notes": []}` as `shows/<id>/epNN.json`

The episode is now a draft in the app's admin page. The owner publishes it.
