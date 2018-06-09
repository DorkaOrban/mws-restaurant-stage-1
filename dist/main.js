let restaurants,neighborhoods,cuisines;var map;var markers=[];let idbSupported=false;document.addEventListener('DOMContentLoaded',(event)=>{fetchNeighborhoods();fetchCuisines();});fetchNeighborhoods=()=>{DBHelper.fetchNeighborhoods((error,neighborhoods)=>{if(error){console.log(error);}else{self.neighborhoods=neighborhoods;fillNeighborhoodsHTML();}});}
fillNeighborhoodsHTML=(neighborhoods=self.neighborhoods)=>{const select=document.getElementById('neighborhoods-select');neighborhoods.forEach(neighborhood=>{const option=document.createElement('option');option.innerHTML=neighborhood;option.value=neighborhood;if(typeof select!='undefined'&&select!==null)select.append(option);});}
fetchCuisines=()=>{DBHelper.fetchCuisines((error,cuisines)=>{if(error){console.log(error);}else{self.cuisines=cuisines;fillCuisinesHTML();}});}
fillCuisinesHTML=(cuisines=self.cuisines)=>{const select=document.getElementById('cuisines-select');cuisines.forEach(cuisine=>{const option=document.createElement('option');option.innerHTML=cuisine;option.value=cuisine;if(typeof select!='undefined'&&select!==null)select.append(option);});}
window.initMap=()=>{let loc={lat:40.722216,lng:-73.987501};self.map=new google.maps.Map(document.getElementById('map'),{zoom:12,center:loc,scrollwheel:false});updateRestaurants();}
updateRestaurants=()=>{const cSelect=document.getElementById('cuisines-select');const nSelect=document.getElementById('neighborhoods-select');if(typeof cSelect!='undefined'&&cSelect!==null){const cIndex=cSelect.selectedIndex;const nIndex=nSelect.selectedIndex;const cuisine=cSelect[cIndex].value;const neighborhood=nSelect[nIndex].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,(error,restaurants)=>{if(error){console.log(error);}else{resetRestaurants(restaurants);fillRestaurantsHTML();}})}}
resetRestaurants=(restaurants)=>{self.restaurants=[];const ul=document.getElementById('restaurants-list');ul.innerHTML='';self.markers.forEach(m=>m.setMap(null));self.markers=[];self.restaurants=restaurants;}
fillRestaurantsHTML=(restaurants=self.restaurants)=>{const ul=document.getElementById('restaurants-list');restaurants.forEach(restaurant=>{ul.append(createRestaurantHTML(restaurant));});const request=async()=>{const response=await[].forEach.call(document.querySelectorAll('img[data-src]'),function(img){img.setAttribute('src',img.getAttribute('data-src'));img.onload=function(){img.removeAttribute('data-src');};});}
request();addMarkersToMap();}
createRestaurantHTML=(restaurant)=>{const li=document.createElement('li');const image=document.createElement('img');image.className='restaurant-img';image.alt=restaurant.name+' Restaurant Image';image.dataset.src=DBHelper.imageUrlForRestaurant(restaurant);li.append(image);const name=document.createElement('h1');name.className="restaurant-h1-name";name.innerHTML=restaurant.name;li.append(name);const neighborhood=document.createElement('p');neighborhood.innerHTML=restaurant.neighborhood;neighborhood.className="neighborhood-p-name";li.append(neighborhood);const address=document.createElement('p');address.innerHTML=restaurant.address;address.className="address-p-name";li.append(address);const more=document.createElement('a');more.innerHTML='View Details';more.setAttribute("aria-label","Read "+restaurant.name+" restaurant details");more.setAttribute("title","Read "+restaurant.name+" restaurant details");more.href=DBHelper.urlForRestaurant(restaurant);li.append(more);return li;}
addMarkersToMap=(restaurants=self.restaurants)=>{restaurants.forEach(restaurant=>{const marker=DBHelper.mapMarkerForRestaurant(restaurant,self.map);google.maps.event.addListener(marker,'click',()=>{window.location.href=marker.url;});self.markers.push(marker);});}