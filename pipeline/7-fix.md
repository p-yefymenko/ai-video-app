# 7. Fix

For **Fix: <id> <epNN>** and **Make videos: <id> <epNN>**. The owner reviewed the episode in the app and left notes (and, once there are videos, cuts).

Download `shows/<id>/epNN.json` from the app. Every note with `"done": false` is a correction. A note with a `clip` is about that clip's frame or video; its `at`, if any, is seconds into the clip. A note without a `clip` is about the whole episode, and its `at` is seconds into the episode.

For each open note, do what it asks:

- **The frame is wrong:** delete `epNN/<clip>.png` and that clip's video, if any, so both get made again. Change the clip in `epNN/clips.md` first if the note asks for something different.
- **Only the video is wrong:** delete `epNN/<clip>.mp4` and remove its entry from `trims`, since those seconds belonged to the old version.
- **It should be shorter:** set that clip's start or end in `trims`. Never cut away dialogue or a story moment to hide a problem; remake the clip instead.
- **The story or dialogue should change:** edit `epNN/clips.md` and delete the frames and videos it affects.

Then set the note's `"done": true`, add an `"answer"` saying in a few words what you did, and upload `epNN.json` back to the app.

Then run step 4 again. For **Make videos**, or if the episode already has videos, delete `epNN.mp4` and run steps 5 and 6 as well.
