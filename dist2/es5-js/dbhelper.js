/**
 * Common database helper functions.
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var database_version = 10;

var DBHelper = (function () {
  function DBHelper() {
    _classCallCheck(this, DBHelper);
  }

  _createClass(DBHelper, null, [{
    key: 'setVersion',
    value: function setVersion(newVersionNumber) {
      this.database_version = newVersionNumber;
      return this.database_version;
    }

    /**
     * Fetch all restaurants and save them into idb.
     */
  }, {
    key: 'fetchRestaurants',
    value: function fetchRestaurants(callback) {
      var _this = this;

      var request = function request() {
        var response;
        return regeneratorRuntime.async(function request$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              context$3$0.next = 2;
              return regeneratorRuntime.awrap(fetch(DBHelper.DATABASE_URL).then(function (response) {
                if (response.ok) {
                  response.json().then(function (json) {
                    var restaurants = json;
                    idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, function (upgradeDB) {
                      console.log('db old ' + upgradeDB.oldVersion);

                      var keyValStore = upgradeDB.createObjectStore('resKeyval');
                      for (var i in restaurants) {
                        keyValStore.put(restaurants[i], i);
                      }
                    })['catch'](function () {
                      console.log('Failed');
                    });

                    callback(null, restaurants);
                  });
                } else {
                  console.log('Request failed. Returned status of ' + response.status + ' with ' + response.statusText);
                }
              })['catch'](function (error) {
                DBHelper.setVersion(DBHelper.DATABASE_VERSION);

                idb.open(DBHelper.DATABASE_NAME, DBHelper.DATABASE_VERSION, function (upgradeDB) {
                  switch (upgradeDB.oldVersion) {
                    case 0:
                      upgradeDB.createObjectStore('resKeyval');

                  }
                }).then(function (db) {
                  return db.transaction('resKeyval').objectStore('resKeyval').getAll();
                }).then(function (allObjs) {
                  return callback(null, allObjs);
                });
              }));

            case 2:
              response = context$3$0.sent;

            case 3:
            case 'end':
              return context$3$0.stop();
          }
        }, null, _this);
      };
      request();
    }

    /**
     * Fetch a restaurant by its ID.
     */
  }, {
    key: 'fetchRestaurantById',
    value: function fetchRestaurantById(id, callback) {

      // fetch all restaurants with proper error handling.
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var restaurant = restaurants.find(function (r) {
            return r.id == id;
          });
          if (restaurant) {
            // Got the restaurant
            callback(null, restaurant);
          } else {
            // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
          }
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
  }, {
    key: 'fetchRestaurantByCuisine',
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
  }, {
    key: 'fetchRestaurantByNeighborhood',
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
  }, {
    key: 'fetchRestaurantByCuisineAndNeighborhood',
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(function (r) {
              return r.cuisine_type == cuisine;
            });
          }
          if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(function (r) {
              return r.neighborhood == neighborhood;
            });
          }
          callback(null, results);
        }
      });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
  }, {
    key: 'fetchNeighborhoods',
    value: function fetchNeighborhoods(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          (function () {
            // Get all neighborhoods from all restaurants
            var neighborhoods = restaurants.map(function (v, i) {
              return restaurants[i].neighborhood;
            });
            // Remove duplicates from neighborhoods
            var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
              return neighborhoods.indexOf(v) == i;
            });
            callback(null, uniqueNeighborhoods);
          })();
        }
      });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
  }, {
    key: 'fetchCuisines',
    value: function fetchCuisines(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          (function () {
            // Get all cuisines from all restaurants
            var cuisines = restaurants.map(function (v, i) {
              return restaurants[i].cuisine_type;
            });
            // Remove duplicates from cuisines
            var uniqueCuisines = cuisines.filter(function (v, i) {
              return cuisines.indexOf(v) == i;
            });
            callback(null, uniqueCuisines);
          })();
        }
      });
    }

    /**
     * Restaurant page URL.
     */
  }, {
    key: 'urlForRestaurant',
    value: function urlForRestaurant(restaurant) {
      return './restaurant.html?id=' + restaurant.id;
    }

    /**
     * Restaurant image URL.
     */
  }, {
    key: 'imageUrlForRestaurant',
    value: function imageUrlForRestaurant(restaurant) {
      var photog = restaurant.photograph;
      if (typeof photog == 'undefined') photog = restaurant.id;
      return '/img/' + photog + '.jpg';
    }

    /**
     * Map marker for a restaurant.
     */
  }, {
    key: 'mapMarkerForRestaurant',
    value: function mapMarkerForRestaurant(restaurant, map) {
      var marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP });
      return marker;
    }
  }, {
    key: 'DATABASE_URL',

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    get: function get() {
      var port = 1337; // Change this to your server port 1337
      //return `http://localhost:${port}/data/restaurants.json`;
      return 'http://localhost:' + port + '/restaurants';
    }

    /**
     * Database name
     */
  }, {
    key: 'DATABASE_NAME',
    get: function get() {
      return 'restaurant-db';
    }
  }, {
    key: 'DATABASE_VERSION',
    get: function get() {
      return database_version;
    }
  }]);

  return DBHelper;
})();