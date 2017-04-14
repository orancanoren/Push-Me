import './style/style.sass';

// User clicks on the push button
var button = document.getElementById('pushbutton');
var error_disp = document.getElementById('error');
function geoLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(push);
  }
  else {
    error_disp.innerHTML = "Navigator doesn't support geolocation";
  }
}
function push(position) {
  fetch('push',
    {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'longitude': position.coords.longitude,
        'latitude': position.coords.latitude
      })
    });
}
button.addEventListener('click', geoLocation);
