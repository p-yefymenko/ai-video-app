// Used by both the viewer (app.js) and the admin page (admin.js).

// h('button', { textContent: 'Hi', onclick }, child, ...) -> a DOM element
function h(tag, props = {}, ...children) {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...children.flat().filter(c => c != null && c !== false));
  return el;
}

// An episode's subtitles (epNN.en.vtt, epNN.ru.vtt): returns [the current line, a button that switches them Off → EN → RU].
// The page draws the line itself: an iPhone refuses to play a video that has <track>s. The choice applies to every video.
const languages = ['off', 'en', 'ru'];
function subtitles(video, base) {
  const line = h('p', { className: 'cue' });
  const button = h('button', { className: 'subs' });
  const cues = {};
  const seconds = time => time.split(':').reduce((total, part) => total * 60 + +part, 0);
  const load = lang => (cues[lang] ??= fetch(`${base}.${lang}.vtt`).then(r => (r.ok ? r.text() : '')).then(text => text.split(/\n\n+/)
    .map(block => block.match(/([\d:.]+) --> ([\d:.]+).*\n([\s\S]+)/)).filter(Boolean)
    .map(([, start, end, text]) => ({ start: seconds(start), end: seconds(end), text: text.trim() }))));
  const draw = async () => {
    const lang = localStorage.getItem('subtitles') || 'off';
    const now = lang === 'off' ? [] : await load(lang);
    line.textContent = now.find(cue => video.currentTime >= cue.start && video.currentTime < cue.end)?.text || '';
  };
  video.addEventListener('timeupdate', draw);
  video.addEventListener('seeked', draw);
  const show = () => {
    button.textContent = `Subtitles: ${(localStorage.getItem('subtitles') || 'off').toUpperCase()}`;
    draw();
  };
  button.onclick = () => {
    const next = languages[(languages.indexOf(localStorage.getItem('subtitles') || 'off') + 1) % languages.length];
    localStorage.setItem('subtitles', next);
    document.dispatchEvent(new Event('subtitles'));
  };
  document.addEventListener('subtitles', show);
  show();
  return [line, button];
}

const list = prefix => fetch(`/api/list?prefix=${encodeURIComponent(prefix)}`).then(r => r.json());
const getJson = key => fetch(`/files/${key}`).then(r => (r.ok ? r.json() : null));

// Every show with its episodes: [{ id, title, description, episodes: [{ name: 'ep01', title, status, trims, notes }] }]
async function loadShows() {
  const { folders } = await list('shows/');
  return Promise.all(folders.map(async folder => {
    const [show, { files, etags }] = await Promise.all([getJson(`${folder}show.json`), list(folder)]);
    const episodeFiles = files.filter(f => /ep\d+\.json$/.test(f)).sort();
    const episodes = await Promise.all(episodeFiles.map(async f => ({ name: f.match(/(ep\d+)\.json$/)[1], etag: etags[f.replace(/json$/, 'mp4')], ...(await getJson(f)) })));
    return { id: folder.split('/')[1], ...show, episodes };
  }));
}
