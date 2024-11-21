import http from 'http';

const PORT = process.env.PORT || 4001;

http
  .createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello Worldss');
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  })
  .listen(PORT)
  .on('listening', () => {
    console.log(`Server is running on port ${PORT}`);
  });
