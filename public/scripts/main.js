// BELOW IS FOR SOCKET + GOOGLEMAPS - THESE 2 ARE SEPARATED.
// 1. SOCKET
const numberInput = document.getElementById('number'),
      textInput = document.getElementById('msg'),
      scheduleSelect = document.getElementById('schedule'),
      button = document.getElementById('button'),
      response = document.querySelector('.response');

button.addEventListener('click', send, false);

const socket = io();
socket.on('smsStatus', function(data){
  if(data.error){
    response.innerHTML = '<h5>Text message sent to ' + data.error + '</h5>';
  }else{
    response.innerHTML = '<h5>Text message sent to ' + data.number + '</h5>';
  }
});

let timeOut;
const getTimeSchedule = ({ time, number, text }) => {
  if(timeOut) clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    fetchServer({ number, text });
  }, time * 60 * 1000);
};

const fetchServer = ({ number, text }) => {
  console.log('send');
  fetch('/smstext', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ number, text })
  })
    .then(function (res) {
      console.log(res);
    })
    .catch(function (err) {
      console.log(err);
    });
};

function send() {
  const number = numberInput.value.replace(/\D/g, '');
  const text = textInput.value;
  const time = parseInt(scheduleSelect.value, 10);
  getTimeSchedule({ number, text, time });
}

// 2. GOOGLEMAPS - still need to call backend for restaurant lat + long

<script>
function initMap() {
  // Map options
  var options = {
    zoom: 8,
    center: { lat: 42.3601, lng: -71.0589 }
  }

  // New map
  var map = new google.maps.Map(document.getElementById('map'), options);

  // Listen for click on map
  google.maps.event.addListener(map, 'click', function (event) {
    // Add marker
    addMarker({ coords: event.latLng });
  });


  // Array of markers
  var markers = [
    {
      coords: { lat: 43.644367, lng: -79.400774 },
      content: '<h1>Starbucks</h1>'
    },
    {
      coords: { lat: 43.644284, lng: -79.403030 },
      content: '<h1>Freshii</h1>'
    },
    {
      coords: { lat: 43.644090, lng: -79.403151 },
      content: '<h1>McDonalds</h1>'
    }
  ];

  // Loop through markers
  for (var i = 0; i < markers.length; i++) {
    // Add marker
    addMarker(markers[i]);
  }

  // Add Marker Function
  function addMarker(props) {
    var marker = new google.maps.Marker({
      position: props.coords,
      map: map,
      //icon:props.iconImage
    });

    // Check for customicon
    if (props.iconImage) {
      // Set icon image
      marker.setIcon(props.iconImage);
    }

    // Check content
    if (props.content) {
      var infoWindow = new google.maps.InfoWindow({
        content: props.content
      });

      marker.addListener('click', function () {
        infoWindow.open(map, marker);
      });
    }
  }
}
</script>
<script async defer
src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA372PcuJQKYrKADjhHTLLDVcfsoCzF-4M&callback=initMap">
</script>
