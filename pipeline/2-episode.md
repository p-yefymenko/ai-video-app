# 2. Episode

Skip if `epNN/clips.md` exists.

Read `show.md` and every earlier `epNN/clips.md`. If the Episodes list has no line for the current episode, add one that continues the story in the same style.

Direct the current episode the way a great micro-drama director would: 2–3 minutes for episode 1, about one minute for the rest, hooking the viewer in the first seconds and ending on a cliffhanger. Use whatever film language serves the story.

Film it like a cinematographer: say how each shot is framed and how the camera moves. When characters interact, keep them in the same frame (two-shots, over the shoulder). Vary wide, medium and close shots. Prefer a few cuts inside a clip over one long static shot.

The video model remembers nothing: it draws every shot from that shot's words alone, and makes every clip separately. So:

- Every shot says where each person in it is and what they are doing, even if an earlier shot already said it ("close-up of Abadon, still on his horse, looking down").
- Every clip makes sense on its own. If it continues the previous clip, its first shot shows again what is going on.
- Show every move on screen. If someone ends up somewhere new, the viewer sees them go there and why.
- Keep the camera on one side of the action within a clip. The model can't turn a scene around: reverse shots and people turning their back come out morphed.
- Describe only what a camera sees, plainly. "Glowing red scars on the faces of dark figures between the trees", not "streaks of red light".

Write it as `epNN/clips.md`, a list of clips. A clip is one video generation of up to 15 seconds and may contain cuts. For example:

```
## 01
Refs: lyra, village
Length: 10
Lyra kneels at the dry village well, ash drifting past. Cut to her cracked hands letting dust run through her fingers. Distant thunder. Lyra, whispering: "One more week and there will be nothing left."
```

`Refs` lists the characters, places and things from `show.md` that appear, if any. The text is everything the viewer sees and hears; it becomes the clip's prompt.

If the episode needs a new character or place, add it to `show.md` first.
