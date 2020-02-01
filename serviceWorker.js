const staticDevCoffee = "dev-coffee-site-v4";//hi
const assets = [
  "/",
  "/site.html",
  "/index.html",
  "/js/app.js"
];

self.addEventListener("install", installEvent => {

  	self.caches.delete('dev-coffee-site-v3');
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets);
	  console.log("dones");
    })
  );
});
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
caches.match(fetchEvent.request,{ignoreSearch:true}).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
