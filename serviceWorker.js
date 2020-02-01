const staticDevCoffee = "dev-coffee-site-v1";
const assets = [
  "/",
  "/site.html",
  "/index.1.html",
  "/js/app.js"
];

self.addEventListener("install", installEvent => {
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
