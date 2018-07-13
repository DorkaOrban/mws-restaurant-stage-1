const CACHE_NAME = 'my-site-cache-v5';
const urlsToCache = [
  // '/',
  '/img/favicon/', 
  '/dist2/css/styles.css',
  '/dist2/css/mobilescreen.css',
  'netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css',
  'dist2/css/star-rating.css',
  '/dist/dbhelper.js',
  '/dist/main.js',
  'dist/common.js',
  '/dist/restaurant_info.js',
  '/404.html',
  '/index.html',
  '/restaurant.html',
];

// Perform install steps
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache).catch(() => {
              console.log('cache: '+cache)
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
  const requestUrl = event.request.url;
  if (requestUrl.endsWith("404.html")) {
    //it is used to detect if the user isn't connected to any netword
    return;
  }

  if (requestUrl.startsWith(self.location.origin)){
    event.respondWith(
      caches.match(event.request, {ignoreSearch:true}).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        let targetCache = CACHE_NAME;
        if (requestUrl.endsWith("jpg")) {
          targetCache = CACHE_NAME;
        }
        if(requestUrl.indexOf("maps.googleapis.com") > -1){
          return fetch(event.request).then(response => {
            console.log(response)
          })
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

self.addEventListener('message', event => {
  console.log(event);

  // var messages = JSON.parse(event.data);
  if (event.data.action === 'skipWaiting') {
     self.skipWaiting();
  }
});

self.addEventListener('sync', event => {
  if (event.tag == 'myFirstSync') {
    //event.waitUntil(doSomeStuff());
    console.log('myFirstSync was called');
  }
  //https://github.com/mauricewipf/Restaurant-Review-App/blob/master/sw.js
  //Swivel
});