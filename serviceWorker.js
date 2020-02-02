const ver=7
const staticDevCoffee = "dev-coffee-site-v"+ver;//hi
const assets = [
  "/",
  "/site.html",
  "/index.html",
  "/js/app.js",
  "/images/icons/icon-144x144.png",
  "/images/icons/icon-72x72.png",
  "/images/icons/icon-96x96.png",
  "/images/icons/icon-128x128.png",
  "/images/icons/icon-152x152.png",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-384x384.png",
  "/images/icons/icon-512x512.png"
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
