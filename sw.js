const CACHE_NAME = "mbp-cache-v1";
const CACHEABLE = /\.(wasm|js|whl|json|css|ico)(\?|$)/;
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var url = e.request.url;
  if(!CACHEABLE.test(url)) return;
  e.respondWith(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.match(e.request).then(function(cached){
        if(cached) return cached;
        return fetch(e.request).then(function(resp){
          if(resp.ok) cache.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});
