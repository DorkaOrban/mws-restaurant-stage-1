(function() {
    if (document.referrer && 
        document.location.host && 
        typeof document.getElementById("back-link") != 'undefined' &&
        document.getElementById("back-link") != null &&
        document.referrer.match(new RegExp("^https?://" + document.location.host))) {
      document.getElementById("back-link").setAttribute("href", document.referrer);
    }
})();