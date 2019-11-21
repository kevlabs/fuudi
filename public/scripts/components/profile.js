class Profile extends ViewComponent {
  render(props, cancel) {
    if (!props.user.isLoggedIn) {
      cancel();
      return props.viewManager.view('login'), { user: props.user };
    }

    this.state = props;

    return $(`
      <div class="profile-info"></div>
      <div id="profile-error" class="help-block"></div>
      <div class="listing-container ${props.isRestaurant && `restaurant` || `user`}-orders"></div>
    `);
  }

  async componentDidMount() {
    try {

      const main = this.state.viewManager;

      // register view components - header + view history
      main.addViewSet(this.$element.siblings('.profile-info')).addView('profile-views', new ProfileHeader());
      main.addViewSet(this.$element.siblings('.listing-container')).addView('profile-views', new ProfileOrders());

      // const user = this.state.user;
      const isRestaurant = this.state.isRestaurant;
      let restaurantInfo;

      // restaurant data, if applicable
      if (isRestaurant) {
        const { data } = await xhr({
          method: 'GET',
          url: `/api/restaurants/${this.state.user.restaurants[0]}`
        });

        if (!data.length) throw Error('Restaurant not found');
        restaurantInfo = data[0];
      }

      // fetch orders for user
      const { data: orders } = await xhr({
        method: 'GET',
        url: `/api/orders${isRestaurant && `/restaurants/${restaurantInfo.id}` || ''}`
      });

      // Create props for order listing

      const nextProps = { user: this.state.user, orders, isRestaurant };
      isRestaurant && (nextProps.restaurant = restaurantInfo);

      // display orders
      main.view('profile-views', nextProps);

    } catch (err) {
      this.$element.siblings('#profile-error').text(err.message);
    }
  }
}
