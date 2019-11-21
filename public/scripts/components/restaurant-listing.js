class RestaurantListing extends ViewComponent {
  render(props) {
    this.state = props;
    console.log('props', props);


    let list = '';
    for (const restaurant of props.restaurants) {
      list += `
        <div class="main listing m-2" data-restaurant-id="${restaurant.id}">
          <p class="restaurant-title">${restaurant.name}</p>
          <p class="restaurant-location">${restaurant.streetAddress}</p>
        </div>
      `;
    }

    return $(list);
  }

  componentDidMount() {
    const main = this.state.mainViewManager;
    this.$element.parent().one('click', 'div.main', evt => {
      evt.preventDefault();

      const restaurantId = $(evt.currentTarget).data('restaurantId');
      console.log('Restaurant Id', restaurantId);

      // switch to menu view
      main.view('menu', { user: this.state.user, restaurantId });
    });

  }
}
