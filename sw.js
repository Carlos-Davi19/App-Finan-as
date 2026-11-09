// Service worker: guarda os arquivos do app no aparelho para abrir sem internet.
// Os dados do usuário não passam por aqui; ficam no IndexedDB.
const VERSAO = '0.1.0-mw9cu4xz';
const CACHE = `financas-${VERSAO}`;
const ARQUIVOS = ['./', 'index.html', 'app.js', 'styles.css', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('financas-') && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// Rede primeiro para a página (pega atualizações); cache primeiro para o resto.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
