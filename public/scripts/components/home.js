class Home extends ViewComponent {
  render(props, cancel) {
    if (!props.user.isLoggedIn) {
      cancel();
      return props.viewManager.view('login', { user: props.user });
    }

    this.state = props;
    return $(`
      <div id="error-container"></div>
      <div class="jumbotron">
        <div class="jumbotron-text">
          <h1 class="display-4">Never waste time.</h1>
          <p class="lead"> Welcome to your premium food ordering  app.</p>
        </div>
      </div>
      <div class="map-container"></div>
      <div class="carousel"></div>
      <div class="listing-container main-container"></div>
    `);
  }

  async componentDidMount() {
    try {

      const main = this.state.viewManager;

      // register viewManagers for map, container and listing
      main.addViewSet(this.$element.siblings('.map-container')).addView('home-views', new RestaurantMap());
      main.addViewSet(this.$element.siblings('.carousel')).addView('home-views', new Carousel());
      main.addViewSet(this.$element.siblings('.listing-container')).addView('home-views', new RestaurantListing());

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
      this.$element.siblings('.error-container').text(err.message);
    }
  }
}
