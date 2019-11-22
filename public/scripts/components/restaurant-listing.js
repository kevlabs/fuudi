class RestaurantListing extends ViewComponent {
  render(props) {
    this.state = props;
    console.log('props', props);


    let list = '';
    for (const restaurant of props.restaurants) {
      list += `
          <div class="main listing m-2" data-restaurant-id="${restaurant.id}">
          <div class="restaurant-img rounded-circle" style="background:     url('${restaurant.photoUrl}') 50% 50% no-repeat;">
          </div>
          <div class="restaurant-text">
            <p class="restaurant-title">${restaurant.name}</p>
            <p class="restaurant-description">${restaurant.description}   </p>
            <p class="restaurant-location">${restaurant.streetAddress}</    p>
          </div>
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

      // switch to menu view
      main.view('menu', { user: this.state.user, restaurantId });
    });

  }
}
