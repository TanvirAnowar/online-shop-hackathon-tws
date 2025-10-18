const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 80;
const API_TARGET = process.env.API_TARGET || 'http://server:3000';
const PUBLIC_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/octet-stream'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=604800'
  });
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', () => {
    res.writeHead(500);
    res.end('Internal Server Error');
  });
}

function proxyApi(req, res) {
  try {
    const target = new URL(API_TARGET);
    const options = {
      hostname: target.hostname,
      port: target.port || 80,
      path: req.url, // keep /api/... path
      method: req.method,
      headers: Object.assign({}, req.headers, { host: target.hostname })
    };

    const proxyReq = http.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', () => {
      res.writeHead(502);
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq, { end: true });
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
}

const server = http.createServer((req, res) => {
  try {
    const safeUrl = decodeURIComponent(req.url.split('?')[0]);

    if (safeUrl.startsWith('/api/')) {
      return proxyApi(req, res);
    }

    let filePath = path.join(PUBLIC_DIR, safeUrl);

    if (filePath.endsWith(path.sep) || path.extname(filePath) === '') {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexFile)) return sendFile(res, indexFile);
      res.writeHead(404);
      return res.end('Not Found');
    }

    return sendFile(res, filePath);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Frontend static server running on port ${PORT}`);
});