// Used by both the viewer (app.js) and the admin page (admin.js).

// h('button', { textContent: 'Hi', onclick }, child, ...) -> a DOM element
function h(tag, props = {}, ...children) {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...children.flat().filter(c => c != null && c !== false));
  return el;
}

// Adds an episode's subtitles (epNN.en.vtt, epNN.ru.vtt) to its video and returns a button that switches them Off → EN → RU.
// The choice is remembered and applies to every video.
const languages = ['off', 'en', 'ru'];
function subtitles(video, base) {
  languages.slice(1).forEach(lang => video.append(h('track', { kind: 'subtitles', srclang: lang, label: lang.toUpperCase(), src: `${base}.${lang}.vtt` })));
  const button = h('button', { className: 'subs' });
  const show = () => {
    const lang = localStorage.getItem('subtitles') || 'off';
    [...video.textTracks].forEach(track => { track.mode = track.language === lang ? 'showing' : 'disabled'; });
    button.textContent = `Subtitles: ${lang.toUpperCase()}`;
  };
  button.onclick = () => {
    const next = languages[(languages.indexOf(localStorage.getItem('subtitles') || 'off') + 1) % languages.length];
    localStorage.setItem('subtitles', next);
    document.dispatchEvent(new Event('subtitles'));
  };
  document.addEventListener('subtitles', show);
  show();
  return button;
}

const list = prefix => fetch(`/api/list?prefix=${encodeURIComponent(prefix)}`).then(r => r.json());
const getJson = key => fetch(`/files/${key}`).then(r => (r.ok ? r.json() : null));

// Every show with its episodes: [{ id, title, description, episodes: [{ name: 'ep01', title, status, trims, notes }] }]
async function loadShows() {
  const { folders } = await list('shows/');
  return Promise.all(folders.map(async folder => {
    const [show, { files }] = await Promise.all([getJson(`${folder}show.json`), list(folder)]);
    const episodeFiles = files.filter(f => /ep\d+\.json$/.test(f)).sort();
    const episodes = await Promise.all(episodeFiles.map(async f => ({ name: f.match(/(ep\d+)\.json$/)[1], ...(await getJson(f)) })));
    return { id: folder.split('/')[1], ...show, episodes };
  }));
}
