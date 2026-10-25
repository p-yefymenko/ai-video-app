// The admin page: start shows, review episodes, cut clips, leave notes for the bot, publish.

const key = localStorage.getItem('adminKey') || prompt('Admin key');
localStorage.setItem('adminKey', key);

// Sends a request with the admin key. If the server refuses the key, asks for it again.
const send = (url, options) => fetch(url, { ...options, headers: { authorization: `Bearer ${key}` } }).then(r => {
  if (r.status === 401) {
    localStorage.removeItem('adminKey');
    alert('Wrong admin key');
    location.reload();
  }
  return r;
});
const put = (path, body) => send(`/files/${encodeURI(path)}`, { method: 'PUT', body });
// Writing and judging go to the director (Claude); drawing and animating go straight to the Grok bot.
const post = (url, done) => task => send(url, { method: 'POST', body: JSON.stringify({ task }) })
  .then(r => r.status !== 401 && alert(r.ok ? done : `Failed: ${r.status}`));
const tellDirector = post('/api/director', 'Sent to the director');
const tellBot = post('/api/bot', 'Sent to the Grok bot');

const root = document.getElementById('admin');
home();

async function home() {
  const shows = await loadShows();
  root.replaceChildren(newShowForm(), ...shows.map(show => h('section', { className: 'panel' },
    h('h2', { textContent: show.title || show.id }),
    h('p', { textContent: `id: ${show.id}` }),
    h('div', { className: 'row' },
      h('button', { textContent: 'Next episode', onclick: () => tellDirector(`Next episode: ${show.id}`) }),
      h('button', { textContent: 'Delete show', onclick: () => deleteShow(show) })),
    h('ul', {}, show.episodes.map(ep => h('li', {},
      h('a', { href: '#', textContent: `${ep.name} · ${ep.title || ''} · ${ep.status}`, onclick: e => { e.preventDefault(); editEpisode(show, ep.name); } })))))));
}

async function deleteShow(show) {
  if (!confirm(`Delete "${show.title || show.id}" and all its episodes from the app?`)) return;
  await send(`/files/shows/${show.id}/`, { method: 'DELETE' });
  home();
}

function newShowForm() {
  const text = h('textarea', { placeholder: 'Describe the show, or attach the script' });
  const file = h('input', { type: 'file' });
  const episodes = h('input', { type: 'number', min: 1, placeholder: 'Episodes' });
  const create = async () => {
    let task = `New show: ${text.value}`;
    if (episodes.value) task += `\nEpisodes: ${episodes.value}`;
    const script = file.files[0];
    if (script) {
      const path = `scripts/${Date.now()}-${script.name.replace(/[^\w.-]+/g, '-')}`;
      await put(path, script);
      task += `\nScript: ${location.origin}/files/${path}`;
    }
    tellDirector(task);
  };
  return h('section', { className: 'panel' }, h('h2', { textContent: 'New show' }), text,
    h('div', { className: 'row' }, file, episodes, h('button', { textContent: 'Create', onclick: create })));
}

async function editEpisode(show, name) {
  const base = `shows/${show.id}/${name}`;
  const data = { trims: {}, notes: [], ...(await getJson(`${base}.json`)) };
  // Each shot may have a first frame (01.png) and a video (01.mp4); the episode is joined into epNN.mp4.
  const files = (await list(`${base}/`)).files.map(f => f.split('/').pop());
  const hasEpisode = (await list(base)).files.includes(`${base}.mp4`);
  const save = () => put(`${base}.json`, JSON.stringify(data, null, 2));

  // The director's clips.md has a "## 01" section per shot; show each section's prompts with its shot.
  const script = await fetch(`/files/${base}/clips.md`).then(r => (r.ok ? r.text() : ''));
  const descriptions = new Map(script.split(/^## /m).slice(1).map(section => {
    const [id, ...lines] = section.trim().split('\n');
    return [id.trim(), lines.filter(line => !/^(#|Refs:|Length:|Layout:)/.test(line)).join('\n').trim()];
  }));
  const clips = [...descriptions.keys()];

  // Every video gets its own notes list. Notes without a clip belong to the whole episode.
  const lists = [];
  const drawNotes = () => lists.forEach(([ul, clip]) => ul.replaceChildren(...data.notes
    .map((note, i) => [note, i])
    .filter(([note]) => note.clip === clip)
    .map(([note, i]) => h('li', { className: note.done ? 'done' : '' },
      label(note),
      note.answer ? h('em', { textContent: ` → ${note.answer}` }) : null,
      h('button', { textContent: 'Delete', onclick: () => { data.notes.splice(i, 1); drawNotes(); save(); } })))));

  // A text box that pins a note to the video's current second (or just to the frame), with its notes below it.
  const notes = (media, clip) => {
    const input = h('input', { placeholder: 'What is wrong here?' });
    const ul = h('ul');
    lists.push([ul, clip]);
    const add = () => {
      if (!input.value) return;
      data.notes.push({ clip, at: media.currentTime === undefined ? undefined : +media.currentTime.toFixed(1), text: input.value, done: false });
      input.value = '';
      drawNotes();
      save();
    };
    return h('div', {}, h('div', { className: 'row' }, input, h('button', { textContent: 'Note here', onclick: add })), ul);
  };

  const episodeVideo = h('video', { src: `/files/${base}.mp4`, controls: true, playsInline: true });
  const publish = h('button', { textContent: data.status === 'published' ? 'Unpublish' : 'Publish' });
  publish.onclick = () => {
    data.status = data.status === 'published' ? 'draft' : 'published';
    publish.textContent = data.status === 'published' ? 'Unpublish' : 'Publish';
    save();
  };

  // Shows what the director will read from epNN.json (open notes and cuts) and asks before sending.
  const ask = () => {
    const open = data.notes.filter(n => !n.done).map(n => `• ${n.clip ? `Clip ${n.clip}` : 'Episode'}: ${label(n)}`);
    const cuts = Object.entries(data.trims).filter(([, t]) => t.start != null || t.end != null)
      .map(([clip, t]) => `• Clip ${clip}: keep from ${t.start ?? 0}s to ${t.end != null ? `${t.end}s` : 'the end'}`);
    const summary = `Notes to fix:\n${open.join('\n') || '• none'}\n\nCuts:\n${cuts.join('\n') || '• none'}\n\nSend to the director?`;
    if (confirm(summary)) tellDirector(`Fix: ${show.id} ${name}`);
  };

  // Drawing and animating, for the given shots or, with none given, for every shot that still misses its file.
  const make = (task, ...only) => tellBot(`${task}: ${show.id} ${name}${only.map(clip => ` ${clip}`).join('')}`);
  const all = (task, what) => () => confirm(`${what} for every shot that doesn't have one yet?`) && make(task);

  root.replaceChildren(
    h('button', { textContent: '← Back', onclick: home }),
    h('h2', { textContent: `${show.title} · ${name} · ${data.title || ''}` }),
    h('div', { className: 'row' },
      h('button', { textContent: 'Draw all frames', onclick: all('Draw', 'Draw the frame') }),
      h('button', { textContent: 'Make all videos', onclick: all('Animate', 'Make the video') }),
      h('button', { textContent: 'Send notes and cuts', onclick: ask }),
      hasEpisode ? publish : null,
      hasEpisode ? subtitles(episodeVideo, `/files/${base}`) : null),
    ...(hasEpisode ? [episodeVideo, notes(episodeVideo)] : [notes({})]),
    h('h3', { textContent: 'Shots' }),
    ...clips.map(clip => clipEditor(`/files/${base}/${clip}`, clip, files, data, save, notes, descriptions.get(clip), make)),
  );
  drawNotes();
}

const label = note => `${note.at != null ? `@ ${note.at}s: ` : ''}${note.text}`;

// One shot: its prompts, its frame or its video with where to cut its start and end, and notes on it.
// Until it has a video, buttons make its missing frame or video.
function clipEditor(path, clip, files, data, save, notes, description, make) {
  const summary = h('details', {}, h('summary', { textContent: description }));
  const hasFrame = files.includes(`${clip}.png`);
  if (!files.includes(`${clip}.mp4`)) return h('div', { className: 'clip' },
    h('h3', { textContent: `Clip ${clip}` }),
    summary,
    hasFrame ? h('img', { src: `${path}.png` }) : null,
    h('div', { className: 'row' },
      hasFrame ? null : h('button', { textContent: 'Draw frame', onclick: () => make('Draw', clip) }),
      h('button', { textContent: 'Make video', onclick: () => make('Animate', clip) })),
    notes({}, clip));

  const video = h('video', { src: `${path}.mp4`, controls: true, playsInline: true, preload: 'metadata' });
  const trim = data.trims[clip] || {};
  const start = h('input', { type: 'number', step: 0.1, placeholder: 'start', value: trim.start ?? '' });
  const end = h('input', { type: 'number', step: 0.1, placeholder: 'end', value: trim.end ?? '' });
  const setTrim = () => {
    data.trims[clip] = { start: start.value === '' ? undefined : +start.value, end: end.value === '' ? undefined : +end.value };
    save();
  };
  start.onchange = end.onchange = setTrim;
  const here = input => () => { input.value = video.currentTime.toFixed(1); setTrim(); };

  // Plays only the kept part: starts at the cut start and pauses at the cut end. Dragging past the end still works.
  let last = 0;
  video.onloadedmetadata = () => { video.currentTime = +start.value || 0; };
  video.ontimeupdate = () => {
    const stop = end.value === '' ? Infinity : +end.value;
    if (last < stop && video.currentTime >= stop) video.pause();
    last = video.currentTime;
  };

  return h('div', { className: 'clip' },
    h('h3', { textContent: `Clip ${clip}` }),
    summary,
    video,
    h('div', { className: 'row' }, start, h('button', { textContent: 'Start here', onclick: here(start) }), end, h('button', { textContent: 'End here', onclick: here(end) })),
    notes(video, clip));
}
