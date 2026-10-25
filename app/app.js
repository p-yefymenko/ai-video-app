// The viewer: a grid of shows, then a vertical swipe feed of a show's published episodes.

const showsEl = document.getElementById('shows');
const feed = document.getElementById('feed');

loadShows().then(shows => {
  for (const show of shows) {
    const episodes = show.episodes.filter(ep => ep.status === 'published');
    if (!episodes.length) continue;
    showsEl.append(h('button', { className: 'card', onclick: () => openFeed(show, episodes) },
      h('img', { src: `/files/shows/${show.id}/cover.jpg`, alt: '' }),
      h('span', { textContent: show.title })));
  }
});

// Plays whichever episode is on screen and pauses the rest.
const observer = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) { target.pause(); continue; }
    target.currentTime = 0;
    target.play().catch(() => { target.muted = true; target.play(); });
  }
}, { threshold: 0.6 });

function openFeed(show, episodes) {
  feed.replaceChildren(
    h('button', { className: 'close', textContent: '×', onclick: () => history.back() }),
    ...episodes.map(ep => {
      const base = `/files/shows/${show.id}/${ep.name}`;
      const video = h('video', { src: `${base}.mp4`, playsInline: true, preload: 'metadata' });
      video.onclick = () => (video.muted ? (video.muted = false) : video.paused ? video.play() : video.pause());
      video.onended = () => video.parentElement.nextElementSibling?.scrollIntoView({ behavior: 'smooth' });
      observer.observe(video);
      return h('section', {}, video, h('p', { className: 'label', textContent: `${show.title} · Ep ${+ep.name.slice(2)}` }), subtitles(video, base));
    }),
  );
  feed.hidden = false;
  history.pushState({ feed: true }, '');
}

// The phone's back button closes the feed.
window.onpopstate = () => {
  feed.querySelectorAll('video').forEach(v => { observer.unobserve(v); v.pause(); });
  feed.hidden = true;
};
