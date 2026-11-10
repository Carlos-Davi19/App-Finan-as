// Service worker: guarda os arquivos do app no aparelho para abrir sem internet.
// Os dados do usuário não passam por aqui; ficam no IndexedDB.
// Cada versão publica app.js e styles.css com a versão no endereço (?v=...), então uma
// versão nova nunca reaproveita o arquivo antigo.
const VERSAO = '0.2.2-mwb4bh3b';
const CACHE = `financas-${VERSAO}`;
const ARQUIVOS = ['./', 'index.html', `app.js?v=${VERSAO}`, `styles.css?v=${VERSAO}`, 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  // cache: 'reload' busca no servidor, ignorando cópias guardadas pelo navegador.
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ARQUIVOS.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('financas-') && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// Página: rede primeiro (pega a versão nova), cópia local se estiver sem internet.
// Demais arquivos: cópia local primeiro; o endereço com versão garante que é a cópia certa.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-cache' }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
