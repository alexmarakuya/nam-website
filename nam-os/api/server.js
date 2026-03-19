const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4100;
const DATA_DIR = path.join(__dirname, '..', 'data');

// ── Helpers ──
function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function safePath(entity, file) {
  // Prevent directory traversal
  const clean = (s) => s.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, clean(entity), clean(file) + '.json');
}

// ── Routes ──
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/');

  // GET /health
  if (req.method === 'GET' && parts[0] === 'health') {
    return json(res, { status: 'ok', timestamp: new Date().toISOString() });
  }

  // GET /entities — list all entities
  if (req.method === 'GET' && parts[0] === 'entities') {
    try {
      const entities = fs.readdirSync(DATA_DIR)
        .filter(f => fs.statSync(path.join(DATA_DIR, f)).isDirectory());
      const result = {};
      for (const entity of entities) {
        const files = fs.readdirSync(path.join(DATA_DIR, entity))
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''));
        result[entity] = files;
      }
      return json(res, result);
    } catch (e) {
      return json(res, { error: 'Failed to list entities' }, 500);
    }
  }

  // GET /data/:entity/:file — read a data file
  if (req.method === 'GET' && parts[0] === 'data' && parts.length === 3) {
    const filePath = safePath(parts[1], parts[2]);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return json(res, data);
    } catch (e) {
      return json(res, { error: 'Not found' }, 404);
    }
  }

  // PUT /data/:entity/:file — write a data file
  if (req.method === 'PUT' && parts[0] === 'data' && parts.length === 3) {
    const filePath = safePath(parts[1], parts[2]);
    try {
      const data = await readBody(req);

      // Update metadata
      data._meta = data._meta || {};
      data._meta.updated = new Date().toISOString();
      data._meta.version = (data._meta.version || 0) + 1;

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Write
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      // Git commit (async, don't block response)
      const { exec } = require('child_process');
      const repoRoot = path.join(__dirname, '..');
      exec(
        `cd "${repoRoot}" && git add "${filePath}" && git commit -m "Update ${parts[1]}/${parts[2]} via NāM OS API" --no-verify`,
        (err) => { if (err) console.error('Git commit failed:', err.message); }
      );

      return json(res, { ok: true, version: data._meta.version, updated: data._meta.updated });
    } catch (e) {
      return json(res, { error: e.message }, 400);
    }
  }

  // GET /data/:entity/:file/history — git log for a file
  if (req.method === 'GET' && parts[0] === 'data' && parts.length === 4 && parts[3] === 'history') {
    const filePath = safePath(parts[1], parts[2]);
    const { execSync } = require('child_process');
    try {
      const log = execSync(
        `cd "${path.join(__dirname, '..')}" && git log --oneline -20 -- "${filePath}"`,
        { encoding: 'utf8' }
      ).trim().split('\n').filter(Boolean).map(line => {
        const [hash, ...msg] = line.split(' ');
        return { hash, message: msg.join(' ') };
      });
      return json(res, { file: `${parts[1]}/${parts[2]}`, history: log });
    } catch (e) {
      return json(res, { history: [] });
    }
  }

  // 404
  json(res, { error: 'Not found' }, 404);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`NāM OS API running on http://127.0.0.1:${PORT}`);
});
