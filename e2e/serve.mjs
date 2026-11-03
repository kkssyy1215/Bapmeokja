// 웹 빌드를 vercel.json과 같은 규칙으로 제공한다: 파일 → 파일.html → /community/[id] → index.html
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const [root, port] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
const isFile = (path) => existsSync(path) && statSync(path).isFile();

createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  const candidates = [join(root, path), join(root, `${path}.html`)];
  if (/^\/community\/[^/]+$/.test(path)) candidates.push(join(root, 'community', '[id].html'));
  candidates.push(join(root, 'index.html'));
  const file = candidates.find(isFile);
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(Number(port), '127.0.0.1');
