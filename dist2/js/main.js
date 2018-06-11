"use strict";var _this=this,restaurants=void 0,neighborhoods=void 0,cuisines=void 0,map,markers=[],idbSupported=!1;document.addEventListener("DOMContentLoaded",function(e){fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=function(){DBHelper.fetchNeighborhoods(function(e,t){e?console.log(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=function(){var e=arguments.length<=0||void 0===arguments[0]?self.neighborhoods:arguments[0],t=document.getElementById("neighborhoods-select");e.forEach(function(e){var n=document.createElement("option");n.innerHTML=e,n.value=e,void 0!==t&&null!==t&&t.append(n)})},fetchCuisines=function(){DBHelper.fetchCuisines(function(e,t){e?console.log(e):(self.cuisines=t,fillCuisinesHTML())})},fillCuisinesHTML=function(){var e=arguments.length<=0||void 0===arguments[0]?self.cuisines:arguments[0],t=document.getElementById("cuisines-select");e.forEach(function(e){var n=document.createElement("option");n.innerHTML=e,n.value=e,void 0!==t&&null!==t&&t.append(n)})},window.initMap=function(){var e={lat:40.722216,lng:-73.987501};self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:e,scrollwheel:!1}),updateRestaurants()},updateRestaurants=function(){var e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select");if(void 0!==e&&null!==e){var n=e.selectedIndex,a=t.selectedIndex,r=e[n].value,s=t[a].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(r,s,function(e,t){e?console.log(e):(resetRestaurants(t),fillRestaurantsHTML())})}},resetRestaurants=function(e){self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(function(e){return e.setMap(null)}),self.markers=[],self.restaurants=e},fillRestaurantsHTML=function(){var e=arguments.length<=0||void 0===arguments[0]?self.restaurants:arguments[0],t=document.getElementById("restaurants-list");e.forEach(function(e){t.append(createRestaurantHTML(e))});!function(){var e;regeneratorRuntime.async(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,regeneratorRuntime.awrap([].forEach.call(document.querySelectorAll("img[data-src]"),function(e){e.setAttribute("src",e.getAttribute("data-src")),e.onload=function(){e.removeAttribute("data-src")}}));case 2:e=t.sent;case 3:case"end":return t.stop()}},null,_this)}(),addMarkersToMap()},createRestaurantHTML=function(e){var t=document.createElement("li"),n=document.createElement("img");n.className="restaurant-img",n.alt=e.name+" Restaurant Image",n.dataset.src=DBHelper.imageUrlForRestaurant(e),t.append(n);var a=document.createElement("h1");a.className="restaurant-h1-name",a.innerHTML=e.name,t.append(a);var r=document.createElement("p");r.innerHTML=e.neighborhood,r.className="neighborhood-p-name",t.append(r);var s=document.createElement("p");s.innerHTML=e.address,s.className="address-p-name",t.append(s);var o=document.createElement("a");return o.innerHTML="View Details",o.setAttribute("aria-label","Read "+e.name+" restaurant details"),o.setAttribute("title","Read "+e.name+" restaurant details"),o.href=DBHelper.urlForRestaurant(e),t.append(o),t},addMarkersToMap=function(){(arguments.length<=0||void 0===arguments[0]?self.restaurants:arguments[0]).forEach(function(e){var t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",function(){window.location.href=t.url}),self.markers.push(t)})};