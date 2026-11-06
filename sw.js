/* E aí, sobrou? — funciona sem internet.
   Ao publicar uma versão nova, aumente o número abaixo para os aparelhos baixarem a atualização. */
const VERSAO = 'eai-sobrou-ad5448c0';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'lib/chart.umd.js', 'lib/xlsx.full.min.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;   // Google Sheets: sempre direto
  if (req.mode === 'navigate') {                                           // página: tenta a versão nova, senão usa a salva
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  if (url.origin === location.origin) {                                    // arquivos do app: usa os salvos
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {           // fonte: salva para usar sem internet
    e.respondWith(caches.open(VERSAO).then(c => c.match(req).then(r => r || fetch(req).then(n => { c.put(req, n.clone()); return n; }))));
  }
});
