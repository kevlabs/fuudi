class Menu extends ViewComponent {
  render(props) {
    this.state = props;
    return $(`
      <div id="error-container"></div>
      <div class="checkout">
        <button type="button" class="btn btn-primary btn-lg">Checkout</button>
      </div>
      <div class="overlay"></div>
      <div class="profile-info"></div>
      <div class="listing-container"></div>
    `);
  }

  async componentDidMount() {
    try {

      const main = this.state.viewManager;

      // overlay, profile and listing are viewManagers
      const profile = main.addViewSet(this.$element.siblings('.profile-info')).addView('menu-views', new MenuProfile());
      const listing = main.addViewSet(this.$element.siblings('.listing-container')).addView('menu-views', new MenuItems());
      const overlay = main.addViewSet(this.$element.siblings('.overlay')).addView('menu-views', new MenuCheckout());

      // fetch restaurant
      const { data: restaurant } = await xhr({
        method: 'GET',
        url: `/api/restaurants/${this.state.restaurantId}`
      });

      if (restaurant.length !== 1) throw Error('Could not find restaurant');

      // bring components into view
      main.view('menu-views', { user: this.state.user, restaurant: restaurant[0], mainViewManager: main });

      // remove pointer to props
      this.state = null;

    } catch (err) {
      console.log(err);

      this.$element.siblings('.error-container').text(err.message);
    }
  }
}
