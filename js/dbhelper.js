/**
 * Common database helper functions.
 */
var database_version = 13;
const port = 1337;
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port 1337 
    //return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:${port}/restaurants/`;
  }

  /**
	 * Database REVIEWS URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_REVIEWS_URL() {
		const port = 1337; 
		return `http://localhost:${port}/reviews/?restaurant_id=`;
  }
  
  static get DATABASE_ALL_REVIEWS() {
		const port = 1337; 
		return `http://localhost:${port}/reviews/`;
	}

  /**
   * Database name
   */
  static get DATABASE_NAME(){
    return 'restaurant-db';
  }

  static get DATABASE_VERSION() {
    return database_version;
  }

  static setVersion(newVersionNumber) {
    this.database_version = newVersionNumber;
    return this.database_version;
  }

  static dbPromise(){
    return idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION +1, upgradeDB => {
      switch(upgradeDB.oldVersion){
        case upgradeDB.oldVersion:{
          if (!upgradeDB.objectStoreNames.contains('resKeyval', {
            keyPath: 'id',
            autoIncrement: true
          })) {
            upgradeDB.createObjectStore('resKeyval', {
              keyPath: 'id',
              autoIncrement: true
            });
          }
        }
        case upgradeDB.oldVersion + 1: {
          const reviewsStore = upgradeDB.createObjectStore('reviews', {
            keyPath: 'id',
            autoIncrement: true
          });
          reviewsStore.createIndex('restaurant', 'restaurant_id');
        }
      }
    });
  }

  /**
   * Fetch all restaurants and save them into idb.
   */
  static fetchRestaurants(callback) { 
    const request = async () => {
        const response = await fetch(DBHelper.DATABASE_URL)
        .then((response) => {
          if(response.ok) {
            response.json().then(json => {
              const restaurants = json;
                  idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, upgradeDB => {
                    //console.log('db old '+upgradeDB.oldVersion)
                  //  if (!upgradeDB.objectStoreNames.contains('resKeyval')) {
                        let keyValStore = upgradeDB.createObjectStore('resKeyval');
                        for(let i in restaurants){ 
                          keyValStore.put(restaurants[i], i);
                        }
                   // }
                  }).catch(() => {
                    console.log('Failed');
                  });
                
                callback(null, restaurants);
            });
          } else {
            console.log(`Request failed. Returned status of ${response.status} with ${response.statusText}`);
          }
        }).catch(error => {
          DBHelper.setVersion(DBHelper.DATABASE_VERSION);
          
          idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION +1, upgradeDB => {
            switch (upgradeDB.oldVersion) {
              case 0:
                upgradeDB.createObjectStore('resKeyval');
                 
            }
          }).then(db => {
            return db.transaction('resKeyval')
              .objectStore('resKeyval').getAll();
          }).then(allObjs => callback(null, allObjs));

        });
    }
    request();

  }

  
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    let photog = restaurant.photograph;

    if(typeof photog  === 'undefined'){
      photog = restaurant.id ? restaurant.id : 10;
      return (`/img/${photog}.jpg`);
    }
    return (`/img/${photog}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */

  static mapMarkerForRestaurant(restaurant, newMap) {
    if(typeof restaurant.latlng !== 'undefined'){
      const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
        {
          title: restaurant.name,
          alt: restaurant.name,
          url: DBHelper.urlForRestaurant(restaurant)
        })
        marker.addTo(newMap);
      return marker;
    }
  } 

  // static mapMarkerForRestaurant(restaurant, map) {
  //   const marker = new google.maps.Marker({
  //     position: restaurant.latlng,
  //     title: restaurant.name,
  //     url: DBHelper.urlForRestaurant(restaurant),
  //     map: map,
  //     animation: google.maps.Animation.DROP}
  //   );
  //   return marker;
  // }

  /** 
   * fetch and cache all reviews
   */

  static fetchAndCacheReviews(){
    return fetch(DBHelper.DATABASE_ALL_REVIEWS)
      .then(response => response.json())
      .then(reviews => {
        return this.dbPromise()
          .then(db => {
            const tx = db.transaction('reviews', 'readwrite');
            const reviewStore = tx.objectStore('reviews');
            reviews.forEach(review => reviewStore.put(review));
            return tx.complete.then(() => Promise.resolve(reviews));
          })
      }).catch(error => {
        idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, upgradeDB => {
    
        }).then(db => {
          return db.transaction('reviews')
            .objectStore('reviews').getAll();
        }).then(allObjs => callback(null, allObjs));
      });
  }

  /**
   * 
   * fetch review by a specific id
   */

	static fetchReviews(id) {
    var reviewsURL = DBHelper.DATABASE_REVIEWS_URL + id;
    
		return fetch(reviewsURL)
			.then(response => response.json())
			.then(reviews => reviews)
			.catch(e => {
          console.log(e);
          return this.getLocalDataByID('reviews', 'restaurant', id)
                  .then((reviews) => {
                  return Promise.resolve(reviews);
          });
      });
  }
  
  static getLocalDataByID(objectStoreName, indexName, indexID){
    const dbPromise = this.dbPromise();
    let id = parseInt(indexID);
    return dbPromise.then((db) => {
          if (!db) return;
          const store = this.getObjectStore(db, objectStoreName, 'readonly');
          const storeIndex = store.index(indexName);
          return Promise.resolve(storeIndex.getAll(id));
        });
  }

  static getObjectStore(dbs, storeName, mode) {
    let tx = dbs.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  static fetchReviewsById(id, callback) {
    
    // fetch all restaurants with proper error handling.
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const review = reviews.find(r => r.restaurant_id == id);
        if (review) { // Got the restaurant
           //console.log('one' + review)
          callback(null, review);
        } else { // Restaurant does not exist in the database
          callback('Review does not exist', null);
        }
      }
    });
  }

  static postFavourite(restaurantId, is_favorite){
    var fetch = window.fetch.bind(window);
    let favorite = is_favorite ? "true": "false";
   let url = `http://localhost:${port}/restaurants/${restaurantId}/?is_favorite=${is_favorite}`;
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({'is_favorite': is_favorite}),
      cache: 'no-cache', 
			credentials: 'same-origin',
			headers: {
				'content-type': 'application/json'
			},
			mode: 'cors', // no-cors, cors, *same-origin
			redirect: 'follow', // *manual, follow, error
			referrer: 'no-referrer', // *client, no-referrer
    }).then( function(response) {
      return response.json();
    }).then( function(data) {
      console.log('Created:', data);
  }) .catch(e =>console.log('postfavourite ',e));
}

static updateFavouriteStatus(restaurantId, isFavourite){
  var fetch = window.fetch.bind(window);

  fetch(`${DBHelper.DATABASE_URL}${restaurantId}`, {
    method: 'PUT',
    body: JSON.stringify({'is_favorite': isFavourite}),
    cache: 'no-cache', 
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json'
    },
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // *manual, follow, error
    referrer: 'no-referrer', // *client, no-referrer
    })
    .then(() =>  {
      console.log('changed');
      this.dbPromise()
        .then(db => {
          const tx = db.transaction('resKeyval', 'readwrite');
          const restaurantStore = tx.objectStore('resKeyval');

          restaurantStore.get(restaurantId)
            .then( restaurant => {
              if(typeof restaurant !== 'undefined'){
                restaurant.is_favorite = isFavourite;
                restaurantStore.put(restaurant);
              }
            })
        })
    })
}

static addReview(review) {
  let offlineObj = {
    name: 'addReview',
    data: review,
    object_type: 'review'
  };
  if(!navigator.onLine && (offlineObj.name === 'addReview')){
    DBHelper.sendDataWhenOnline(offlineObj);
    //return;
  }
  let reviewSend = {
    "name": review.name,
    "rating": review.rating,
    "comments" : review.comments,
    "restaurant_id": parseInt(review.restaurant_id)
  };
  var fetchOptions = {
    method: "POST",
    body: JSON.stringify(reviewSend),
    headers: {
			'content-type': 'application/json'
		}
  };

  return fetch(DBHelper.DATABASE_ALL_REVIEWS, fetchOptions)
    .then(response => {
      const contentType = response.headers.get('content-type');
      if(contentType && contentType.indexOf('application/json') !== -1){
        return response.json();
      }else{
        return 'API call successfull';
      }
    })
    .then(data =>{
      idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, upgradeDB => {
      }).then(db => {
         db.transaction('reviews', 'readwrite')
          .objectStore('reviews').put(data).complete();
          return data;
      })
    })
    .catch(e => {
      // idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, upgradeDB => {
      // }).then(db => {
      //   return db.transaction('reviews', 'readwrite')
      //     .objectStore('reviews').put(data).complete();
      // })
    });
}

static sendDataWhenOnline(offlineObj){
  console.log('sendDataWhenOnline')
  localStorage.setItem('data', JSON.stringify(offlineObj.data));
  window.addEventListener('online', event => {
    let data = JSON.parse(localStorage.getItem('data'));
    [...document.querySelectorAll(".reviews_offline")]
      .forEach( el => {
        el.classList.remove("reviews_offline")
        el.querySelector(".offline_label").remove()
      });
      if(data !== null){
        if(offlineObj.name === 'addReview'){
          DBHelper.addReview(offlineObj.data);
        }
        localStorage.removeItem('data');
      }
  })
}
}
