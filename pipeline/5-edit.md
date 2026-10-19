# 5. Edit

Skip if `epNN.mp4` exists.

Join the clips in shot order. In `/workspace/shows/<id>/epNN/`:

```
ls [0-9][0-9].mp4 | sed "s/.*/file '&'/" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c:v libx264 -crf 18 -c:a aac ../epNN.mp4
```

Upload `epNN.mp4` to Google Drive, folder `ai-video-app/<id>/`.
