class Profile extends ViewComponent {
  render(props, cancel) {

    if (!props.user.isLoggedIn) {
      cancel();
      return props.viewManager.view('login');
    }

    this.state = props;
    const restaurantInfo = props.restaurantInfo;

    return $(`
      <div class="profile-info rounded-circle">
        <div class="user-img rounded-circle" style="background: url(${restaurantInfo && `${restaurantInfo.photoUrl}` || `../../imgs/profile-hex.png`}) 50% 50% no-repeat;">
        </div>
        ${restaurantInfo && `
          <p class="profile-name">${restaurantInfo.name}</p>
          <p class="user-details">Email: ${restaurantInfo.email}</p>
          <p class="user-details">Phone: ${restaurantInfo.phone}</p>
          <p class="user-details">Address: ${restaurantInfo.streetAddress}<br/>${restaurantInfo.city}, ${restaurantInfo.postCode}</p>
        ` || `
          <p class="profile-name">${props.user.username}</p>
          <p class="user-details">Email: ${props.user.email}</p>
          <p class="user-details">Phone: ${props.user.phone}</p>
        `}
      </div>
      <div id="profile-error" class="help-block"></div>
      <div class="listing-container ${restaurantInfo && `restaurant` || `user`}-orders"></div>
    `);
  }

  async componentDidMount() {
    try {
      // manager order history for
      const orderHistory = this.state.viewManager.addViewSet($(`.listing-container.${this.state.restaurantInfo && `restaurant` || `user`}-orders`));
      orderHistory.addView('orders', new ProfileOrders());

      // fetch orders for user
      const { data: orders } = await xhr({
        method: 'GET',
        url: `/api/orders${this.state.restaurantInfo && `/restaurants/${this.state.restaurantInfo.id}` || ''}`
      });

      // Create props for order listing

      const nextProps = { user: this.state.user, orders };
      this.state.restaurantInfo && (nextProps.restaurant = this.state.restaurantInfo);

      // display orders
      orderHistory.view('orders', nextProps);

    } catch (err) {
      this.$element.siblings('#profile-error').text(err.message);
    }
  }
}
