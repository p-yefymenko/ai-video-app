# 2. Episode

Skip if `epNN/clips.md` exists.

Read `show.md` and every earlier `epNN/clips.md`. If the Episodes list has no line for the current episode, add one that continues the story in the same style.

Direct the current episode the way a great micro-drama director would: 2–3 minutes for episode 1, about one minute for the rest, hooking the viewer in the first seconds and ending on a cliffhanger.

Film it like a cinematographer, as a list of shots. Each shot is one clip: one video generation of 3–10 seconds with no cuts inside, because the video model blends its own cuts into morphing crossfades. Say how the shot is framed and how the camera moves; a slow push-in, pan or follow keeps a shot alive. Hold a shot while the moment plays out and cut only when the viewer needs to see something new, so the episode isn't choppy. When characters interact, keep them in the same frame (two-shots, over the shoulder).

The video model remembers nothing: it draws every clip from that clip's words alone. So:

- Every clip says where each person in it is and what they are doing, even if an earlier clip already said it ("Abadon, still on his horse, looks down").
- Show every move on screen. If someone ends up somewhere new, the viewer sees them go there and why.
- The camera doesn't circle the action and people don't turn their back to it; the model morphs them when they turn.
- Describe only what a camera sees, plainly. "Glowing red scars on the faces of dark figures between the trees", not "streaks of red light".

Write it as `epNN/clips.md`. For example:

```
## 01
Refs: lyra, village
Length: 8
Wide shot, slow push-in: Lyra kneels at the dry village well, ash drifting past, and lets dust run through her cracked fingers. Distant thunder. Lyra, whispering: "One more week and there will be nothing left."

## 02
Start: 01
Refs: lyra, village
Length: 6
Lyra, still kneeling at the well, lifts her head toward the thunder and slowly stands.
```

`Refs` lists the characters, places and things from `show.md` that appear, if any. Add `Start: <clip>` only when a clip picks up exactly where that earlier clip ended, from the same camera position: it will start from that clip's last frame. The text is everything the viewer sees and hears; it becomes the clip's prompt.

If the episode needs a new character, place or thing, add it to `show.md` first.
