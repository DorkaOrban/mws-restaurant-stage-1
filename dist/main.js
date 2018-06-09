let restaurants,neighborhoods,cuisines;var map,markers=[];let idbSupported=!1;document.addEventListener('DOMContentLoaded',()=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=()=>{DBHelper.fetchNeighborhoods((a,b)=>{a?console.log(a):(self.neighborhoods=b,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=(a=self.neighborhoods)=>{const b=document.getElementById('neighborhoods-select');a.forEach(c=>{const d=document.createElement('option');d.innerHTML=c,d.value=c,'undefined'!=typeof b&&null!==b&&b.append(d)})},fetchCuisines=()=>{DBHelper.fetchCuisines((a,b)=>{a?console.log(a):(self.cuisines=b,fillCuisinesHTML())})},fillCuisinesHTML=(a=self.cuisines)=>{const b=document.getElementById('cuisines-select');a.forEach(c=>{const d=document.createElement('option');d.innerHTML=c,d.value=c,'undefined'!=typeof b&&null!==b&&b.append(d)})},window.initMap=()=>{updateRestaurants()},updateRestaurants=()=>{const a=document.getElementById('cuisines-select'),b=document.getElementById('neighborhoods-select');if('undefined'!=typeof a&&null!==a){const c=a.selectedIndex,d=b.selectedIndex,e=a[c].value,f=b[d].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(e,f,(g,h)=>{g?console.log(g):(resetRestaurants(h),fillRestaurantsHTML())})}},resetRestaurants=a=>{self.restaurants=[];const b=document.getElementById('restaurants-list');b.innerHTML='',self.markers.forEach(c=>c.setMap(null)),self.markers=[],self.restaurants=a},fillRestaurantsHTML=(a=self.restaurants)=>{const b=document.getElementById('restaurants-list');a.forEach(d=>{b.append(createRestaurantHTML(d))});(async()=>{await[].forEach.call(document.querySelectorAll('img[data-src]'),function(e){e.setAttribute('src',e.getAttribute('data-src')),e.onload=function(){e.removeAttribute('data-src')}})})(),addMarkersToMap()},createRestaurantHTML=a=>{const b=document.createElement('li'),c=document.createElement('img');c.className='restaurant-img',c.alt=a.name+' Restaurant Image',c.dataset.src=DBHelper.imageUrlForRestaurant(a),b.append(c);const d=document.createElement('h1');d.className='restaurant-h1-name',d.innerHTML=a.name,b.append(d);const e=document.createElement('p');e.innerHTML=a.neighborhood,e.className='neighborhood-p-name',b.append(e);const f=document.createElement('p');f.innerHTML=a.address,f.className='address-p-name',b.append(f);const g=document.createElement('a');return g.innerHTML='View Details',g.setAttribute('aria-label','Read '+a.name+' restaurant details'),g.setAttribute('title','Read '+a.name+' restaurant details'),g.href=DBHelper.urlForRestaurant(a),b.append(g),b},addMarkersToMap=(a=self.restaurants)=>{a.forEach(b=>{const c=DBHelper.mapMarkerForRestaurant(b,self.map);google.maps.event.addListener(c,'click',()=>{window.location.href=c.url}),self.markers.push(c)})};