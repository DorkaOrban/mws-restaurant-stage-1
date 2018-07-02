/**
 * Common database helper functions.
 */
var database_version = 10;
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port 1337 
    //return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:${port}/restaurants`;
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
                    console.log('db old '+upgradeDB.oldVersion)
                    
                    let keyValStore = upgradeDB.createObjectStore('resKeyval');
                    for(let i in restaurants){ 
                      keyValStore.put(restaurants[i], i);
                    }
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
          
          idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, upgradeDB => {
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
    if(typeof photog  == 'undefined') photog = restaurant.id;
    return (`/img/${photog}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   *  Post review 
  */

  static postHelper(opts) {
    console.log('Posting request to API...');
    let url = `http://localhost:1337/reviews/`;
    fetch(url, {
      method: 'post',
      body: JSON.stringify(opts)
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log('Created:', data);
    });
    return;
  }

  static getReviews(restaurantId){
    let url = `http://localhost:${port}/reviews/?restaurant_id=${restaurantId}`;
    fetch(url, {
      method: 'get',
      body: JSON.stringify(opts)
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log('Created:', data);
    });
    return;
  }
 }
