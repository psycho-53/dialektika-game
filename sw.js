/* Dialektika 2.0 offline cache. Never cache or transmit localStorage save data. */
const CACHE='dialektika-static-v20';
const ASSETS=['./','./index.html','./styles.css?v=20','./game.js?v=20','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./assets/school-of-athens.jpg'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.allSettled(ASSETS.map(async url=>{const response=await fetch(new Request(url,{cache:'reload'}));if(response.ok)await cache.put(url,response)}));
 self.skipWaiting();
})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith('dialektika-static-')&&name!==CACHE).map(name=>caches.delete(name)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{try{const fresh=await fetch(request);if(fresh.ok){const cache=await caches.open(CACHE);cache.put('./index.html',fresh.clone()).catch(()=>{})}return fresh}catch(e){return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error()}})());
 }else{
  event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{})}return response}catch(e){return Response.error()}})());
 }
});