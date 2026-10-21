// The backend. Every piece of data is a file in R2:
//   shows/<id>/show.json, shows/<id>/cover.jpg, shows/<id>/show.md, shows/<id>/refs/<id>.png
//   shows/<id>/epNN.json, shows/<id>/epNN.mp4, shows/<id>/epNN/<clip>.mp4
//   scripts/<file>   show scripts uploaded from the admin page
// Anyone can read. Writing needs the admin key. /api/bot wakes the Grok Bot.

const TYPES = { mp4: 'video/mp4', json: 'application/json', jpg: 'image/jpeg', png: 'image/png', md: 'text/markdown; charset=utf-8' };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);
    const authed = req.headers.get('authorization') === `Bearer ${env.ADMIN_KEY}`;

    if (path === '/api/list') {
      const list = await env.BUCKET.list({ prefix: url.searchParams.get('prefix') || '', delimiter: '/' });
      return Response.json({ files: list.objects.map(o => o.key), folders: list.delimitedPrefixes });
    }

    if (path === '/api/bot' && req.method === 'POST') {
      if (!authed) return new Response('Unauthorized', { status: 401 });
      const res = await fetch(env.BOT_WEBHOOK_URL, {
        method: 'POST',
        headers: { authorization: `Bearer ${env.BOT_WEBHOOK_KEY}`, 'content-type': 'application/json' },
        body: await req.text(),
      });
      return new Response(await res.text(), { status: res.status });
    }

    if (path.startsWith('/files/')) {
      const key = path.slice('/files/'.length);
      if (req.method === 'GET' || req.method === 'HEAD') return read(env, key, req);
      if (!authed) return new Response('Unauthorized', { status: 401 });
      if (req.method === 'PUT') {
        const contentType = TYPES[key.split('.').pop()] || 'application/octet-stream';
        await env.BUCKET.put(key, req.body, { httpMetadata: { contentType } });
        return new Response('OK');
      }
      if (req.method === 'DELETE') {
        // A key ending in "/" deletes the whole folder.
        const keys = key.endsWith('/') ? (await env.BUCKET.list({ prefix: key })).objects.map(o => o.key) : [key];
        await env.BUCKET.delete(keys);
        return new Response('OK');
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

// Serves a file, with byte ranges so videos can seek.
async function read(env, key, req) {
  const obj = await env.BUCKET.get(key, { range: req.headers, onlyIf: req.headers });
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers({ etag: obj.httpEtag, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' });
  obj.writeHttpMetadata(headers);
  if (!obj.body) return new Response(null, { status: 304, headers });

  if (obj.range && req.headers.has('range')) {
    const offset = obj.range.offset ?? obj.size - obj.range.suffix;
    const length = obj.range.length ?? obj.size - offset;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    return new Response(obj.body, { status: 206, headers });
  }
  return new Response(obj.body, { headers });
}
