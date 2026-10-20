// The admin page: start shows, review episodes, cut clips, leave notes for the bot, publish.

const key = localStorage.getItem('adminKey') || prompt('Admin key');
localStorage.setItem('adminKey', key);
const auth = { authorization: `Bearer ${key}` };

const put = (path, body) => fetch(`/files/${encodeURI(path)}`, { method: 'PUT', headers: auth, body });
const tellBot = task => fetch('/api/bot', { method: 'POST', headers: auth, body: JSON.stringify({ task }) })
  .then(r => alert(r.ok ? 'Sent to the bot' : `Failed: ${r.status}`));

const root = document.getElementById('admin');
home();

async function home() {
  const shows = await loadShows();
  root.replaceChildren(newShowForm(), ...shows.map(show => h('section', { className: 'panel' },
    h('h2', { textContent: show.title || show.id }),
    h('div', { className: 'row' },
      h('button', { textContent: 'Next episode', onclick: () => tellBot(`Next episode: ${show.id}`) }),
      h('button', { textContent: 'Delete show', onclick: () => deleteShow(show) })),
    h('ul', {}, show.episodes.map(ep => h('li', {},
      h('a', { href: '#', textContent: `${ep.name} · ${ep.title || ''} · ${ep.status}`, onclick: e => { e.preventDefault(); editEpisode(show, ep.name); } })))))));
}

async function deleteShow(show) {
  if (!confirm(`Delete "${show.title || show.id}" and all its episodes from the app?`)) return;
  await fetch(`/files/shows/${show.id}/`, { method: 'DELETE', headers: auth });
  home();
}

function newShowForm() {
  const text = h('textarea', { placeholder: 'Describe the show, or attach the script' });
  const file = h('input', { type: 'file' });
  const create = async () => {
    let task = `New show: ${text.value}`;
    const script = file.files[0];
    if (script) {
      const path = `scripts/${Date.now()}-${script.name.replace(/[^\w.-]+/g, '-')}`;
      await put(path, script);
      task += `\nScript: ${location.origin}/files/${path}`;
    }
    tellBot(task);
  };
  return h('section', { className: 'panel' }, h('h2', { textContent: 'New show' }), text, file, h('button', { textContent: 'Create', onclick: create }));
}

async function editEpisode(show, name) {
  const base = `shows/${show.id}/${name}`;
  const data = { trims: {}, notes: [], ...(await getJson(`${base}.json`)) };
  const clips = (await list(`${base}/`)).files.filter(f => f.endsWith('.mp4')).sort();
  const save = () => put(`${base}.json`, JSON.stringify(data, null, 2));

  const notesEl = h('ul');
  const drawNotes = () => notesEl.replaceChildren(...data.notes.map((note, i) => h('li', { className: note.done ? 'done' : '' },
    `${note.clip ? `Clip ${note.clip}` : 'Episode'} @ ${note.at}s: ${note.text}`,
    note.answer ? h('em', { textContent: ` → ${note.answer}` }) : null,
    h('button', { textContent: 'Delete', onclick: () => { data.notes.splice(i, 1); drawNotes(); save(); } }))));
  drawNotes();

  // A text box plus a button that pins the note to the video's current second.
  const noteInput = (video, clip) => {
    const input = h('input', { placeholder: 'What is wrong here?' });
    const add = () => {
      if (!input.value) return;
      data.notes.push({ clip, at: +video.currentTime.toFixed(1), text: input.value, done: false });
      input.value = '';
      drawNotes();
      save();
    };
    return h('div', { className: 'row' }, input, h('button', { textContent: 'Note here', onclick: add }));
  };

  const episodeVideo = h('video', { src: `/files/${base}.mp4`, controls: true, playsInline: true });
  const publish = h('button', { textContent: data.status === 'published' ? 'Unpublish' : 'Publish' });
  publish.onclick = () => {
    data.status = data.status === 'published' ? 'draft' : 'published';
    publish.textContent = data.status === 'published' ? 'Unpublish' : 'Publish';
    save();
  };

  root.replaceChildren(
    h('button', { textContent: '← Back', onclick: home }),
    h('h2', { textContent: `${show.title} · ${name} · ${data.title || ''}` }),
    h('div', { className: 'row' }, publish, h('button', { textContent: 'Send notes and cuts to the bot', onclick: () => tellBot(`Fix: ${show.id} ${name}`) })),
    episodeVideo,
    noteInput(episodeVideo),
    h('h3', { textContent: 'Notes' }), notesEl,
    h('h3', { textContent: 'Clips' }),
    ...clips.map(file => clipEditor(file, data, save, noteInput)),
  );
}

// One clip: its video, where to cut its start and end, and notes on it.
function clipEditor(file, data, save, noteInput) {
  const clip = file.match(/(\w+)\.mp4$/)[1];
  const video = h('video', { src: `/files/${file}`, controls: true, playsInline: true, preload: 'metadata' });
  const trim = data.trims[clip] || {};
  const start = h('input', { type: 'number', step: 0.1, placeholder: 'start', value: trim.start ?? '' });
  const end = h('input', { type: 'number', step: 0.1, placeholder: 'end', value: trim.end ?? '' });
  const setTrim = () => {
    data.trims[clip] = { start: start.value === '' ? undefined : +start.value, end: end.value === '' ? undefined : +end.value };
    save();
  };
  start.onchange = end.onchange = setTrim;
  const here = input => () => { input.value = video.currentTime.toFixed(1); setTrim(); };

  return h('div', { className: 'clip' },
    h('h3', { textContent: `Clip ${clip}` }),
    video,
    h('div', { className: 'row' }, start, h('button', { textContent: 'Start here', onclick: here(start) }), end, h('button', { textContent: 'End here', onclick: here(end) })),
    noteInput(video, clip));
}
