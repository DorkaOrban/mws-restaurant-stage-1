'use strict';

var _this = this;

var restaurants = undefined,
    neighborhoods = undefined,
    cuisines = undefined;
var map;
var markers = [];
var idbSupported = false;

/**
 * Check indexedDB's availability and fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', function (event) {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = function () {
  DBHelper.fetchNeighborhoods(function (error, neighborhoods) {
    if (error) {
      // Got an error
      console.log(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = function () {
  var neighborhoods = arguments.length <= 0 || arguments[0] === undefined ? self.neighborhoods : arguments[0];

  var select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    if (typeof select != 'undefined' && select !== null) select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = function () {
  DBHelper.fetchCuisines(function (error, cuisines) {
    if (error) {
      // Got an error!
      console.log(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = function () {
  var cuisines = arguments.length <= 0 || arguments[0] === undefined ? self.cuisines : arguments[0];

  var select = document.getElementById('cuisines-select');

  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    if (typeof select != 'undefined' && select !== null) select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {
  var loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = function () {
  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');

  if (typeof cSelect != 'undefined' && cSelect !== null) {
    var cIndex = cSelect.selectedIndex;
    var nIndex = nSelect.selectedIndex;

    var cuisine = cSelect[cIndex].value;
    var neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
      if (error) {
        // Got an error!
        console.log(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = function (restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(function (m) {
    return m.setMap(null);
  });
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = function () {
  var restaurants = arguments.length <= 0 || arguments[0] === undefined ? self.restaurants : arguments[0];

  var ul = document.getElementById('restaurants-list');
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant));
  });

  var request = function request() {
    var response;
    return regeneratorRuntime.async(function request$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return regeneratorRuntime.awrap([].forEach.call(document.querySelectorAll('img[data-src]'), function (img) {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.onload = function () {
              img.removeAttribute('data-src');
            };
          }));

        case 2:
          response = context$2$0.sent;

        case 3:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  };
  request();
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = function (restaurant) {
  var li = document.createElement('li');

  var image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = restaurant.name + ' Restaurant Image';
  image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  var name = document.createElement('h1');
  name.className = "restaurant-h1-name";
  name.innerHTML = restaurant.name;
  li.append(name);

  var neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.className = "neighborhood-p-name";
  li.append(neighborhood);

  var address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.className = "address-p-name";
  li.append(address);

  var more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute("aria-label", "Read " + restaurant.name + " restaurant details");
  more.setAttribute("title", "Read " + restaurant.name + " restaurant details");
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = function () {
  var restaurants = arguments.length <= 0 || arguments[0] === undefined ? self.restaurants : arguments[0];

  restaurants.forEach(function (restaurant) {
    // Add marker to the map
    var marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', function () {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};