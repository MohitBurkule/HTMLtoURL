const ver=5
const staticDevCoffee = "dev-coffee-site-v"+ver;//hi
const assets = [
  "/",
  "/site.html",
  "/index.html",
  "/js/app.js"
];

self.addEventListener("install", installEvent => {
	for(i=1;i<ver;i++)
  	self.caches.delete('dev-coffee-site-v'+i);
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
