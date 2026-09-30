/* 日貫 現地記録（2D）— オフライン用。版が変わると古いキャッシュを消す */
const C = "hinui-record-6efdcd0d";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("hinui-record-") && k !== C)
    .map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // ★キャッシュを先に返す（電波の弱い谷で待たされない）。電波があれば裏で新しい版を入れておき、次に開いたとき効く
  e.respondWith(caches.open(C).then(c => c.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(r => { if(r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if(hit){ e.waitUntil(net); return hit; }
    return net.then(r => r || c.match("./index.html"));
  })));
});
