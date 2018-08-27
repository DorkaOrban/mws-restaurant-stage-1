let restaurants,
  neighborhoods,
  cuisines;
var map, newMap;
var markers = [];
let idbSupported = false;
const mapboxToken = "pk.eyJ1IjoiZG9ya2FvOTQiLCJhIjoiY2pqbGUwN3E5MDRtYjNxcWYycTE2enN0ZCJ9.b8CfdzH5oHBIsUjmvkOf-g";


/**
 * Check indexedDB's availability and fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.log(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    if(typeof select != 'undefined' && select !== null) select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.log(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    if(typeof select != 'undefined' && select !== null) select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */

initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,'+
      ' <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">'+
      'Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: mapboxToken
  }).addTo(newMap);

  updateRestaurants();
}

// window.initMap = () => {
//   let loc = {
//     lat: 40.722216,
//     lng: -73.987501
//   };
//   self.map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 12,
//     center: loc,
//     scrollwheel: false
//   });
//   updateRestaurants();
// }

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  if(typeof cSelect != 'undefined' && cSelect !== null) {
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.log(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    })
  }
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    if(typeof restaurant.name !== 'undefined'){
      ul.append(createRestaurantHTML(restaurant));
    }
  });

  const request = async () => {
      const response = await [].
      forEach.call(document.querySelectorAll('img[data-src]'), function(img) {
      img.setAttribute('src', img.getAttribute('data-src'));
      img.onload = function() {
        img.removeAttribute('data-src');
      };
    });
  }
  request();
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = restaurant.name + ' Restaurant Image';
  image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h1');
  name.className = "restaurant-h1-name";
  name.innerHTML = restaurant.name;
  li.append(name);

  const span = document.createElement('span');
  span.className = "save-to-favourite";
  li.appendChild(span);
  const aSave = document.createElement('a');
  aSave.className = "save-heart-span";
  aSave.classList.add("myFavorite");
  aSave.id = "saveHeart"+restaurant.id;
  aSave.href = "javascript:void(0)";

  aSave.onclick = function() {
    const isFavNow = !restaurant.is_favorite;
    DBHelper.updateFavouriteStatus(restaurant.id, isFavNow);
    restaurant.is_favorite = isFavNow;
    changeFavElementClass(aSave, isFavNow);
  }
  changeFavElementClass(aSave, restaurant.is_favorite);  
  
  aSave.innerHTML = 'Save to favourite <i class="fa fa-heart"></i>';
  span.appendChild(aSave);
  const br = document.createElement('br');
  li.appendChild(br);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.className = "neighborhood-p-name";
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.className = "address-p-name";
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute("aria-label", "Read "+ restaurant.name + " restaurant details");
  more.setAttribute("title", "Read "+ restaurant.name + " restaurant details"); 
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}

changeFavElementClass = (el, fav) => {
  if (!fav){
    el.classList.remove('favourite_yes');
    el.classList.add('favourite_no');
    el.setAttribute('aria-label', 'mark as favourite');
  }else{
    console.log('toggle yes update');
    el.classList.add('favourite_yes');
    el.classList.remove('favourite_no');
    el.setAttribute('aria-label', 'remove as favourite');
  }
}

/**
 * Add markers for current restaurants to the map.
 */

addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    if(typeof marker !== 'undefined'){
      marker.on("click", onClick => window.location.href = marker.options.url);
      self.markers.push(marker);
    }
  });

} 

// addMarkersToMap = (restaurants = self.restaurants) => {
//   restaurants.forEach(restaurant => {
//     // Add marker to the map
//     const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
//     google.maps.event.addListener(marker, 'click', () => {
//       window.location.href = marker.url;
//     });
//     self.markers.push(marker);
//   });
// }



 
