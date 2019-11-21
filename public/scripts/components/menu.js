class Menu extends ViewComponent {
  render(props, cancel) {
    if (!props.user.isLoggedIn) {
      cancel();
      return props.viewManager.view('login', { user: props.user });
    }

    this.state = props;
    return $(`
      <div id="error-container"></div>
      <div class="checkout">
        <button type="button" class="btn btn-primary btn-lg"><span id="cart-menu-button">Checkout</span></button>
      </div>
      <div class="overlay shadow bg-white rounded">
        <button id="minimize-checkout" class="btn btn-success" type="button"><span id="checkout-button"><p>Minimize Cart</p></span></button>
      </div>
      <div class="profile-info"></div>
      <div class="listing-container"></div>
    `);
  }

  async componentDidMount() {
    try {

      const main = this.state.viewManager;

      // register checkout, restaurant profile and menu items viewManagers
      main.addViewSet(this.$element.siblings('.profile-info')).addView('menu-views', new MenuProfile());
      main.addViewSet(this.$element.siblings('.listing-container')).addView('menu-views', new MenuItems());
      main.addViewSet(this.$element.siblings('.overlay')).addView('menu-views', new MenuCheckout());

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
