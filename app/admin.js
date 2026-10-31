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
let timer; // reloads the open episode now and then
start();

// The open episode is kept in the address (#<show>/<epNN>), so a reload comes back to it.
async function start() {
  const [id, name] = location.hash.slice(1).split('/');
  const show = id && (await loadShows()).find(s => s.id === id);
  if (show) editEpisode(show, name);
  else home();
}

async function home() {
  clearInterval(timer);
  history.replaceState(null, '', location.pathname);
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

// The episode page loads the episode again every 15 seconds, and right after a button is pressed, and rebuilds only
// the parts that changed, so new frames, videos and the director's answers appear without the page jumping.
async function editEpisode(show, name) {
  clearInterval(timer);
  const base = `shows/${show.id}/${name}`;
  const data = { trims: {}, notes: [] };
  let files = [], shots = new Map(), clips = [];
  let saves = 0, saved = Promise.resolve();
  const save = () => { saves++; saved = put(`${base}.json`, JSON.stringify(data, null, 2)); };

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

  // Shows what the director will read from epNN.json (open notes and cuts) and asks before sending.
  const ask = () => {
    const open = data.notes.filter(n => !n.done).map(n => `• ${n.clip ? `Clip ${n.clip}` : 'Episode'}: ${label(n)}`);
    const cuts = Object.entries(data.trims).filter(([, t]) => t.start != null || t.end != null)
      .map(([clip, t]) => `• Clip ${clip}: keep from ${t.start ?? 0}s to ${t.end != null ? `${t.end}s` : 'the end'}`);
    const summary = `Notes to fix:\n${open.join('\n') || '• none'}\n\nCuts:\n${cuts.join('\n') || '• none'}\n\nSend to the director?`;
    if (confirm(summary)) tellDirector(`Fix: ${show.id} ${name}`);
  };

  // Drawing and animating, for the given shots or, with none given, for every shot that still misses its file.
  // Shots sent to the bot are remembered in this browser until their file appears, and their buttons spin meanwhile.
  const pending = JSON.parse(localStorage.getItem('pending') || '{}');
  const file = (task, clip) => `${clip}.${task === 'Draw' ? 'png' : 'mp4'}`;
  const make = (task, ...only) => {
    (only.length ? only : clips).filter(clip => !files.includes(file(task, clip))).forEach(clip => { pending[`${base}/${file(task, clip)}`] = true; });
    localStorage.setItem('pending', JSON.stringify(pending));
    update();
    tellBot(`${task}: ${show.id} ${name}${only.map(clip => ` ${clip}`).join('')}`);
  };
  const button = (task, clip) => {
    const busy = pending[`${base}/${file(task, clip)}`];
    return h('button', { className: busy ? 'busy' : '', textContent: task === 'Draw' ? 'Draw frame' : 'Make video',
      onclick: () => (!busy || confirm('Already sent to the Grok bot. Send again?')) && make(task, clip) });
  };

  const all = (task, what) => () => {
    const answer = prompt(`${what} for which shots, such as "01-20" or "03 07"? Leave empty for every shot that doesn't have one yet.`);
    if (answer === null) return;
    const ranges = (answer.match(/\d+(-\d+)?/g) || []).map(range => range.split('-').map(Number));
    make(task, ...clips.filter(clip => ranges.some(([from, to = from]) => +clip >= from && +clip <= to)));
  };

  const top = hasEpisode => {
    const episodeVideo = h('video', { src: `/files/${base}.mp4`, controls: true, playsInline: true });
    const publish = h('button', { textContent: data.status === 'published' ? 'Unpublish' : 'Publish' });
    publish.onclick = () => {
      data.status = data.status === 'published' ? 'draft' : 'published';
      publish.textContent = data.status === 'published' ? 'Unpublish' : 'Publish';
      save();
    };
    return h('div', {},
      h('button', { textContent: '← Back', onclick: home }),
      h('h2', { textContent: `${show.title} · ${name} · ${data.title || ''}` }),
      h('div', { className: 'row' },
        h('button', { textContent: 'Draw all frames', onclick: all('Draw', 'Draw the frame') }),
        h('button', { textContent: 'Make all videos', onclick: all('Animate', 'Make the video') }),
        h('button', { textContent: 'Send notes and cuts', onclick: ask }),
        hasEpisode ? publish : null,
        hasEpisode ? subtitles(episodeVideo, `/files/${base}`) : null),
      ...(hasEpisode ? [episodeVideo, notes(episodeVideo)] : [notes({})]));
  };

  const update = async () => {
    await saved;
    const before = saves;
    const [json, folder, outside, script] = await Promise.all([getJson(`${base}.json`), list(`${base}/`), list(base),
      fetch(`/files/${base}/clips.md`).then(r => (r.ok ? r.text() : ''))]);
    // A note or cut saved meanwhile may be missing from what was just loaded; the next load will have it.
    if (saves !== before) return;
    Object.assign(data, { trims: {}, notes: [] }, json);
    // Each shot may have a first frame (01.png) and a video (01.mp4); the episode is joined into epNN.mp4.
    files = folder.files.map(f => f.split('/').pop());
    const hasEpisode = outside.files.includes(`${base}.mp4`);
    Object.keys(pending).filter(key => key.startsWith(`${base}/`) && files.includes(key.slice(base.length + 1))).forEach(key => delete pending[key]);
    localStorage.setItem('pending', JSON.stringify(pending));

    // The director's clips.md has "# Scene N" sections with a "## 01" section per shot; show each shot's prompts,
    // and the scene picture and reference images its frame is drawn from.
    shots = new Map();
    let scene;
    script.split(/^## /m).forEach((section, i) => {
      const [id, ...lines] = section.trim().split('\n');
      const refs = (lines.find(line => line.startsWith('Refs:')) || 'Refs:').slice(5).split(',').map(ref => ref.trim()).filter(Boolean);
      if (i) shots.set(id.trim(), {
        description: lines.filter(line => !/^(#|Refs:|Length:|Layout:)/.test(line)).join('\n').trim(),
        sources: [scene && `${base}/scene-${scene}.png`, ...refs.map(ref => `shows/${show.id}/refs/${ref}.png`)].filter(Boolean),
      });
      scene = section.match(/^# Scene (\d+)/m)?.[1] ?? scene;
    });
    clips = [...shots.keys()];

    // Each part is [id, what it shows, how to build it].
    place(root, [
      ['top', [hasEpisode, data.title], () => top(hasEpisode)],
      ...files.filter(f => /^scene-\d+\.png$/.test(f)).map(f => [f, '', () => h('div', { className: 'clip' },
        h('h3', { textContent: f.slice(0, -4) }), h('img', { src: `/files/${base}/${f}` }), notes({}, f.slice(0, -4)))]),
      ['shots', '', () => h('h3', { textContent: 'Shots' })],
      ...clips.map(clip => [clip, [shots.get(clip), ...['png', 'mp4'].map(ext => [files.includes(`${clip}.${ext}`), pending[`${base}/${clip}.${ext}`]])],
        () => clipEditor(`/files/${base}/${clip}`, clip, files, data, save, notes, shots.get(clip), button)]),
    ]);
    drawNotes();
  };

  history.replaceState(null, '', `#${show.id}/${name}`);
  await update();
  timer = setInterval(() => document.hidden || update(), 15000);
}

// Puts the parts in order under parent, building a part again only when what it shows has changed. The rest stay
// as they are, so the page doesn't jump, and a playing video or a half-typed note survives.
function place(parent, parts) {
  const old = new Map([...parent.children].map(el => [el.dataset.id, el]));
  parts.forEach(([id, shows, build], i) => {
    const key = JSON.stringify(shows);
    let el = old.get(id);
    if (el?.dataset.key !== key) {
      const fresh = build();
      Object.assign(fresh.dataset, { id, key });
      el?.replaceWith(fresh);
      el = fresh;
    }
    if (parent.children[i] !== el) parent.insertBefore(el, parent.children[i] || null);
  });
  while (parent.children.length > parts.length) parent.lastElementChild.remove();
}

const label = note => `${note.at != null ? `@ ${note.at}s: ` : ''}${note.text}`;

// One shot: its prompts and the pictures it is drawn from, its frame or its video with where to cut its start and end,
// and notes on it. Until it has a video, buttons make its missing frame or video.
function clipEditor(path, clip, files, data, save, notes, { description, sources }, button) {
  const summary = h('div', {}, h('details', {}, h('summary', { textContent: description })),
    h('div', { className: 'row sources' }, sources.map(src => h('a', { href: `/files/${src}`, target: '_blank' }, h('img', { src: `/files/${src}`, title: src.split('/').pop() })))));
  const hasFrame = files.includes(`${clip}.png`);
  if (!files.includes(`${clip}.mp4`)) return h('div', { className: 'clip' },
    h('h3', { textContent: `Clip ${clip}` }),
    summary,
    hasFrame ? h('img', { src: `${path}.png` }) : null,
    h('div', { className: 'row' },
      hasFrame ? null : button('Draw', clip),
      button('Animate', clip)),
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
