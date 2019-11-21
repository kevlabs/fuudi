class RestaurantMap extends ViewComponent {
  render(props) {
    this.state = props;

    return $(`
      <div id="map" ></div>
    `);
  }

  async componentDidMount() {
    try {
      const restaurants = this.state.restaurants;
      const { latitude: lat, longitude: lng } = await getGeoCoordinates({ latitude: 43.644272, longitude: -79.402242 });


      // GOOGLE MAPS
      // new map
      const map = new google.maps.Map(document.querySelector('#map'), {
        zoom: 17,
        center: { lat, lng }
      });

      const addMarker = function ({ coords, content }) {
        const marker = new google.maps.Marker({
          position: coords,
          map
        });

        // set infowindow content
        const infoWindow = new google.maps.InfoWindow({ content });


        marker.addListener('click', function () {
          infoWindow.open(map, marker);
        });
      };

      // initialize restaurant markers
      restaurants.forEach(({ name, latitude: lat = lat, longitude: lng = lng }) => {
        addMarker({
          coords: { lat, lng },
          content: `<h1>${name}</h1>`
        });
      });

    } catch (err) {
      console.log(`Failed to load Google Maps: Error: ${err.message}`);
    }
  }
}
