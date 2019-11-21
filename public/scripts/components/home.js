class Home extends ViewComponent {
  render(props) {
    this.state = props;
    return $(`
      <div id="error-container"></div>
      <div class="map-container"></div>
      <div class="carousel"></div>
      <div class="listing-container main-container"></div>
    `);
  }

  async componentDidMount() {
    try {

      const main = this.state.viewManager;

      // map, container and listing are viewManagers
      const map = main.addViewSet(this.$element.siblings('.map-container')).addView('home-views', new RestaurantMap());
      const carousel = main.addViewSet(this.$element.siblings('.carousel')).addView('home-views', new Carousel());
      const listing = main.addViewSet(this.$element.siblings('.listing-container')).addView('home-views', new RestaurantListing());

      // fetch restaurants
      const { data: restaurants } = await xhr({
        method: 'GET',
        url: '/api/restaurants'
      });

      // bring components into view
      main.view('home-views', { user: this.state.user, restaurants, mainViewManager: main });

      // remove pointer to props
      this.state = null;

    } catch (err) {
      console.log(err);

      this.$element.siblings('.error-container').text(err.message);
    }
  }
}
