const CACHE_NAME = "mbp-cache-v1772752235";
const HEAVY_ASSETS = /\.(wasm|whl)(\?|$)/;
const LIGHT_ASSETS = /\.(js|json|css|ico)(\?|$)/;
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var url = e.request.url;
  if(HEAVY_ASSETS.test(url)){
    // Cache-first for large binaries (wasm, whl) — rarely change
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
  } else if(LIGHT_ASSETS.test(url)){
    // Network-first for JS/JSON/CSS — picks up app updates immediately
    e.respondWith(
      fetch(e.request).then(function(resp){
        if(resp.ok){
          var respClone = resp.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, respClone); });
        }
        return resp;
      }).catch(function(){
        return caches.open(CACHE_NAME).then(function(cache){ return cache.match(e.request); });
      })
    );
  }
});
