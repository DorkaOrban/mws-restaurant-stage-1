const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/img/',
  '/index.html',
  '/restaurant.html?id=<ID>',
  '/css/styles.css',
  '/css/mobilescreen.css',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/data/restaurants.json'
];

self.addEventListener('install', (event) => {
    // Perform install steps
     // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// this is the service worker which intercepts all http requests
self.addEventListener('fetch', (event)  => {
  event.respondWith(
    caches.match(event.request).then( (response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then( (resp)  => {
      return resp || fetch(event.request).then( (response) => {
        return caches.open(CACHE_NAME).then( (cache) => {
          cache.put(event.request, response.clone());
          return response;
        });  
      });
    })
  );
});

self.addEventListener('fetch',  (event) => {
  event.respondWith(
    caches.match(event.request).then( (resp) => {
      return resp || fetch(event.request).then( (response) => {
        let responseClone = response.clone();
        caches.open(CACHE_NAME).then( (cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }).catch(function() {
      // return caches.match('/sw-test/gallery/myLittleVader.jpg');
    })
  );
});

self.addEventListener('activate', (event) => {
    console.log('Activating new service worker...');
  
    var cacheWhitelist = ['my-site-cache-v1'];
  
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map( (cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});