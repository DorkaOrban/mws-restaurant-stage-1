function isBrowserCompatiblewithServiceWorkers() {
  if (!navigator.serviceWorker) {
    console.log("ServiceWorker is not compatible with this browser...");
    return false;
  }
  return true;
}

function registerServiceWorker() {
  if (!isBrowserCompatiblewithServiceWorkers()) {
    return;
  }
  console.log("ServiceWorker is compatible with this browser!");
  navigator.serviceWorker.register("sw.js").then(
    function(registration) {
      // Registration was successful
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    },
    function(err) {
      console.log("ServiceWorker registration failed: ", err);
    }
  );
}

function checkServiceWorkerController() {
  if (!isBrowserCompatiblewithServiceWorkers()) {
    return;
  }
  if (navigator.serviceWorker.controller) {
    console.log(
      "This page is currently controlled by:",
      navigator.serviceWorker.controller
    );
  } else {
    console.log(
      "This page is not currently controlled " + "by a service worker."
    );
  }
}
window.addEventListener("load", function() {
  //openDatabase();
  registerServiceWorker();
  checkServiceWorkerController();
  let homeLinks = document.querySelectorAll(".jsHomeLink");
  for (const link of homeLinks) {
    link.href = `./`;
  }
  
  // var regex = new RegExp("%3c.*%3e","i");
  // if( 'referrer' in document ) { 
  //   console.log(document.referrer);
  // }
  // var script = regex.exec(window.location.href);
  // if (script) {
  //     window.location.href = document.referrer; 
  // }

  this.fetch("../assets/404.html").catch(response => {
    if (response.name === "TypeError") {
      //Show the placeholder and hide the map element
      let mapOfflineMsgBlock = document.querySelector(
        ".map-offline-placeholder"
      );
      let mapBlock = document.querySelector("#map");
      if (mapOfflineMsgBlock != null && mapBlock != null) {
        mapBlock.style.display = "none";
        mapOfflineMsgBlock.style.display = "block";
      }
    }
  });
});