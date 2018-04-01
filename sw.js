const CACHE_NAME = 'my-site-cache-v5';
const urlsToCache = [
  './',
  // '/img/',
  '/data/restaurants.json', 
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/css/mobilescreen.css',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
];

self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache).catch(() => {
              console.log('cache: '+cache)
              console.log('cache error')
              console.log('urlsToCache: '+urlsToCache)
            });
        }) 
    );
});

self.addEventListener('activate', (event) => {
  console.log('Activating new service worker...');

  const cacheWhitelist = ['my-site-cache-v1', 'my-site-cache-v2', 'my-site-cache-v3', 'my-site-cache-v4', 'my-site-cache-v5'];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return !cacheWhitelist.includes(cacheName);
        })
      );
    }).then((cacheWhitelist) => {
      console.log(`${CACHE_NAME} now ready to handle fetches!`);
      return Promise.all(
        cacheWhitelist.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// this is the service worker which intercepts all http requests

self.addEventListener("fetch", event => {
  // Skip cross-origin requests, like those for Google Analytics or Maps
  const requestUrl = event.request.url;
  if (requestUrl.endsWith("assets/404.html")) {
    //Do not catchoffline.html.
    //It is used to detect if the user isn't connected to any netword
    return;
  }
  if (requestUrl.startsWith(self.location.origin)){
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        let targetCache = CACHE_NAME;
        if (requestUrl.endsWith("jpg")) {
          targetCache = CACHE_NAME;
        }
        return caches
          .open(targetCache)
          .then(cache => {
            return fetch(event.request)
              .then(response => {
                // Put a copy of the response in the runtime cache.
                return cache
                  .put(event.request, response.clone())
                  .then(() => {
                    return response;
                  })
                  .catch(err => {
                    console.log(`cache.put failed on ${requestUrl}`, err);
                  });
              })
              .catch(err => {
                console.log(`fetch failed on ${requestUrl}`, err);
              });
          })
          .catch(err => {
            console.log(`cache.match failed ${requestUrl}`, err);
          });
      })
    );
  }
});