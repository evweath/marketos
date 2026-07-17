const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key:  fs.readFileSync(path.join(__dirname, 'certs', '127.0.0.1-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', '127.0.0.1.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      await handle(req, res, parse(req.url, true));
    } catch (err) {
      console.error('Error:', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
  });
});
