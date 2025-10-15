const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 80;
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
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=604800' // cache static assets
  });
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', () => {
    res.writeHead(500);
    res.end('Internal Server Error');
  });
}

const server = http.createServer((req, res) => {
  try {
    const safeUrl = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(PUBLIC_DIR, safeUrl);

    // Prevent path traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(400);
      return res.end('Bad Request');
    }

    // If request is directory or no extension, try to serve index.html (SPA fallback)
    if (filePath.endsWith(path.sep) || path.extname(filePath) === '') {
      filePath = path.join(filePath, 'index.html');
    }

    // If file doesn't exist, fallback to SPA index.html
    if (!fs.existsSync(filePath)) {
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexFile)) {
        return sendFile(res, indexFile);
      }
      res.writeHead(404);
      return res.end('Not Found');
    }

    sendFile(res, filePath);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  // Logging to stdout is fine for containers
  console.log(`Frontend static server running on port ${PORT}`);
});