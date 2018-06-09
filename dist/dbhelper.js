var database_version=10;class DBHelper{static get DATABASE_URL(){const port=1337
    return `http://localhost:${port}/restaurants`}
    static get DATABASE_NAME(){return'restaurant-db'}
    static get DATABASE_VERSION(){return database_version}
    static setVersion(newVersionNumber){this.database_version=newVersionNumber;return this.database_version}
    static fetchRestaurants(callback){const request=async()=>{const response=await fetch(DBHelper.DATABASE_URL).then((response)=>{if(response.ok){response.json().then(json=>{const restaurants=json;idb.open(DBHelper.DATABASE_NAME,DBHelper.DATABASE_VERSION,upgradeDB=>{console.log('db old '+upgradeDB.oldVersion)
    let keyValStore=upgradeDB.createObjectStore('resKeyval');for(let i in restaurants){keyValStore.put(restaurants[i],i)}}).catch(()=>{console.log('Failed')});callback(null,restaurants)})}else{console.log(`Request failed. Returned status of ${response.status} with ${response.statusText}`)}}).catch(error=>{DBHelper.setVersion(DBHelper.DATABASE_VERSION);idb.open(DBHelper.DATABASE_NAME,DBHelper.DATABASE_VERSION,upgradeDB=>{switch(upgradeDB.oldVersion){case 0:upgradeDB.createObjectStore('resKeyval');case 1:}}).then(db=>{return db.transaction('resKeyval').objectStore('resKeyval').getAll()}).then(allObjs=>callback(null,allObjs))})}
    request()}
    static fetchRestaurantById(id,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const restaurant=restaurants.find(r=>r.id==id);if(restaurant){callback(null,restaurant)}else{callback('Restaurant does not exist',null)}}})}
    static fetchRestaurantByCuisine(cuisine,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const results=restaurants.filter(r=>r.cuisine_type==cuisine);callback(null,results)}})}
    static fetchRestaurantByNeighborhood(neighborhood,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const results=restaurants.filter(r=>r.neighborhood==neighborhood);callback(null,results)}})}
    static fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{let results=restaurants
    if(cuisine!='all'){results=results.filter(r=>r.cuisine_type==cuisine)}
    if(neighborhood!='all'){results=results.filter(r=>r.neighborhood==neighborhood)}
    callback(null,results)}})}
    static fetchNeighborhoods(callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const neighborhoods=restaurants.map((v,i)=>restaurants[i].neighborhood)
    const uniqueNeighborhoods=neighborhoods.filter((v,i)=>neighborhoods.indexOf(v)==i)
    callback(null,uniqueNeighborhoods)}})}
    static fetchCuisines(callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const cuisines=restaurants.map((v,i)=>restaurants[i].cuisine_type)
    const uniqueCuisines=cuisines.filter((v,i)=>cuisines.indexOf(v)==i)
    callback(null,uniqueCuisines)}})}
    static urlForRestaurant(restaurant){return(`./restaurant.html?id=${restaurant.id}`)}
    static imageUrlForRestaurant(restaurant){let photog=restaurant.photograph;if(typeof photog=='undefined')photog=restaurant.id;return(`/img/${photog}.jpg`)}
    static mapMarkerForRestaurant(restaurant,map){const marker=new google.maps.Marker({position:restaurant.latlng,title:restaurant.name,url:DBHelper.urlForRestaurant(restaurant),map:map,animation:google.maps.Animation.DROP});return marker}}