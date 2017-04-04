var geocoder;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((success, fail));

function success(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longtitude;
  codeLatLng(lat, lng);
}

function fail() {
  alert("Geocoder failed");
}

function initialize() {
  geocoder = new google.maps.Geocoder();
}

function codeLatLng(lat, lng) {
  var city;
  var latlng = new google.maps.LatLng(lat, lng);
  geocoder.geocode({ 'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      console.log(results);
      if(results[1]) {
        // formatted address
        // get country name
        for (var i = 0; i < results[0].address_components.length; i++) {
          for (var b = 0; b < results[0].address_components[i].types.length; b++) {
            if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
              city = results[0].address_components[i];
              break;
            }
          }
        }
        return city.short_name + " " + city.long_name;
      }
      else {
        alert("No results found");
      }
    }
    else {
      alert("Geocoder failed due to: " + status);
    }
  })
}

var but = document.getElementById('push_button');
but.addEventListener('click', function() {
  var city = codeLatLng();
  if (! city) {
    console.error('city is undefined');
    return;
  }
  fetch('push', {
    method: 'post',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      'country': 'Turkey',
      'city': city;
    })
  })
});
