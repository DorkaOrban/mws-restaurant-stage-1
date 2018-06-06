function browserCompatibilitywithServiceWorkers() {
  if (!navigator.serviceWorker) {
    console.log("The Service Worker is not compatible with this browser!");
    return false;
  }
  return true;
}

function registerServiceWorker() {
  if (!browserCompatibilitywithServiceWorkers()) {
    return;
  }
  console.log("The Service Worker is compatible with this browser!");

  navigator.serviceWorker.register("sw.js").then( registration => {
      console.log("Service Worker registration successful with scope: ", registration.scope);
    }
  ).catch(error => {
    console.log("Service Worker registration failed: ", err);
    return;
  });

  // navigator.serviceWorker.addEventListener('controllerchange', () => {
  //   window.location.reload();
  // });
}

function checkServiceWorkerController() {
  if (!browserCompatibilitywithServiceWorkers()) {
    return;
  }
  if (navigator.serviceWorker.controller) {
    console.log("This page is currently controlled by: ", navigator.serviceWorker.controller);
  } else{
    console.log("This page is not currently controlled by a service worker.");
  }
}

window.addEventListener("load", function() { 
  if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){ 
    // Do Firefox-related activities
    if(typeof document.getElementById("restaurants-list") != 'undefined' && document.getElementById("restaurants-list") !== null) {
      document.getElementById("restaurants-list").style.marginLeft = "-43px"; 
    }
  }

  registerServiceWorker();
  checkServiceWorkerController();
  let homeLinks = document.querySelectorAll(".jsHomeLink");
  for (const link of homeLinks) {
    link.href = `./`;
  }
 

  this.fetch("404.html").catch(response => {
    if (response.name === "TypeError") {
      //Show the placeholder and hide the map element
      let mapOfflineMsgBlock = document.querySelector(
        ".map-offline-placeholder"
      );
      let mapBlock = document.getElementById("map");
      if (mapOfflineMsgBlock != null && mapBlock != null) {
        mapBlock.style.display = "none";
        mapOfflineMsgBlock.style.display = "block";
      }
    }
  });
});
