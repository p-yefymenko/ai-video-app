# 6. Fix

For **Fix: <id> <epNN>**. The owner reviewed the episode in the app and left notes and cuts.

Download `shows/<id>/epNN.json` from the app. Every note with `"done": false` is a correction. Its `at` is seconds into the clip when it has a `clip`, otherwise seconds into the whole episode.

For each open note, do what it asks:

- **The clip is broken or wrong:** delete `epNN/<clip>.mp4` so it gets made again. Change the clip in `epNN/clips.md` first if the note asks for something different.
- **It should be shorter:** set that clip's start or end in `trims`.
- **The story or dialogue should change:** edit `epNN/clips.md` and delete the clips it affects.

Then set the note's `"done": true`, add an `"answer"` saying in a few words what you did, and upload `epNN.json` back to the app.

Finally delete `epNN.mp4` and run steps 4 and 5 again.
