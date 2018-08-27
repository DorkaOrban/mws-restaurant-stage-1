let restaurant;
var map, newMap;
const mapboxToken = "pk.eyJ1IjoiZG9ya2FvOTQiLCJhIjoiY2pqbGUwN3E5MDRtYjNxcWYycTE2enN0ZCJ9.b8CfdzH5oHBIsUjmvkOf-g";

/**
 * Initialize Google map, called from HTML.
 */
// window.initMap = () => {
//   fetchRestaurantFromURL((error, restaurant) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.map = new google.maps.Map(document.getElementById('map'), {
//         zoom: 16,
//         center: restaurant.latlng,
//         scrollwheel: false
//       });
//       fillBreadcrumb();
//       DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
//     }
//   });
// }

document.addEventListener('DOMContentLoaded', event => {  
  initMap();
});

initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox.streets',
          accessToken: mapboxToken
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      
      fillRestaurantHTML();

      fillReviewsHTML(self.restaurant.id);
      const request = async () => {
        const response = await
          [].forEach.call(document.querySelectorAll('img[data-src]'),    function(img) {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.onload = function() {
              img.removeAttribute('data-src');
            };
          });
      }
      request();
      callback(null, restaurant)
    });
    DBHelper.fetchAndCacheReviews();
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  // image.sizes = "(max-width: 800px) 100vw, 800px";  
  image.alt = restaurant.name + ' Restaurant Image';
  image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.className = "days-of-week";
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (id = self.restaurant.id) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  
  const span = document.createElement('span');
  span.className = "save-to-favourite";
  container.appendChild(span);
  const br = document.createElement('br');

  const sendReviewButton = document.createElement('button');
  sendReviewButton.className = "send-review-button";
  sendReviewButton.id = "sendReviewBtn";
  sendReviewButton.innerHTML = "Send a review";   
  sendReviewButton.onclick = () => {
    document.getElementsByClassName('add-review')[0].style.display = 'block';
  }
  const formContainer = document.getElementById('form-container');
  const reviewFormContainer = document.getElementById('reviewFormContent');
  formContainer.insertBefore(title, reviewFormContainer);
  formContainer.insertBefore(sendReviewButton, reviewFormContainer);
  formContainer.insertBefore(br, reviewFormContainer);

	var reviews = DBHelper.fetchReviews(id)
    .then(reviews => {
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      })
      container.appendChild(ul);
    });

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  if(!navigator.onLine){
    const connectionStatus = document.createElement('p');
    connectionStatus.classList.add('offline_label');
    connectionStatus.innerHTML = "Offline";
    li.classList.add("reviews_offline");
    li.appendChild(connectionStatus);
  }
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = "reviews-user-name";
  li.appendChild(name);

  const date = document.createElement('p');
  const reviewDate = new Date(review.createdAt);
  date.innerHTML = reviewDate.getDate() +'/'+ reviewDate.getMonth() + '/'+reviewDate.getFullYear()
  // date.innerHTML = reviewDate.toLocaleString();
  date.className = "reviews-user-date";
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = "reviews-user-rating reviews-user-common"; 
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = "reviews-user-comments reviews-user-common"; 
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

submitReview = () => {
  const name = document.getElementById('reviewerName').value;
  const content = document.getElementById('reviewBody').value;
  const rad = document.reviewForm.rating;
  const rating = rad.value;
  const match = window.location.href.match(/id=(\d+)/);
  if (match) {
      var restaurantID = match[1];
  }
  const frontendReview = {
    restaurant_id: parseInt(restaurantID),
    rating: rating,
    name: name,
    comments: content.substring(0, 300),
    createdAt: new Date()
  }
	if (content) {
      DBHelper.addReview(frontendReview);
      createReviewHTML(frontendReview);
      if(navigator.onLine){
        window.location.reload();
      }
      console.log('frontendReview.name:',frontendReview.name);
      document.getElementById('reviewFormContent').reset();
  }  
}

