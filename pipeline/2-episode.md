# 2. Episode

Skip if `epNN/clips.md` exists.

Read `show.md` and every earlier `epNN/clips.md`. If the Episodes list has no line for the current episode, add one that continues the story in the same style.

Direct the current episode the way a great micro-drama director would: 2–3 minutes for episode 1, about one minute for the rest, hooking the viewer in the first seconds and ending on a cliffhanger.

Split it into scenes, and each scene into shots. Each shot is one clip: a still first frame that gets animated into 3–10 seconds of video, with no cuts inside. Write it as `epNN/clips.md`:

```
# Scene 1: the well at noon
Layout: The stone well stands in the middle of the dusty square, huts all around; the road comes in from the left. Lyra kneels on the right side of the well, facing left. Her clay cup sits on the well's rim.

## 01
Refs: lyra, village
Length: 8
Frame: Wide shot from the road. Lyra kneels at the right side of the well, facing left, her cracked hands full of dust, ash drifting in the air.
Action: Slow push-in. She lets the dust run through her fingers. Hot wind rattles the dry reeds on the roofs. Lyra, whispering: "One more week and there will be nothing left."
```

- **Layout:** where everything in the scene is: the place, the props, each person and which way they face. Every shot in the scene follows it.
- **Refs:** the characters, places and things from `show.md` in the shot.
- **Frame:** the first frame as a still picture: framing, and where each person is, which way they face and what they are doing.
- **Action:** only what moves and what is heard during the shot. Keep it to one simple movement and a slow camera move at most. People don't turn around and the camera doesn't circle them; the model morphs bodies that turn.

Direct for a model that knows nothing but each shot's words:

- Every shot shows something new: a new angle, a new person, new information. Otherwise it is part of the previous shot.
- Show every move. If someone ends up somewhere new, the viewer sees them go there and why.
- Every spoken line belongs to someone in the frame, speaking to someone the viewer knows is there. No off-screen voices. Someone talking to themselves is framed in profile, so they don't talk to the camera.
- The model draws whatever the text mentions. A sound that matters has its source in the frame; don't mention sounds of things that aren't there.
- Describe only what a camera sees, plainly. "Glowing red scars on the faces of dark figures between the trees", not "streaks of red light".

When it's written, read it as a viewer who only sees the pictures: is it always clear where everyone is, who speaks to whom, and why each shot follows the last? Fix what isn't.

If the episode needs a new character, place or thing, add it to `show.md` first.
