class RestaurantListing extends ViewComponent {
  render(props) {
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
    this.$element.parent().one('click', 'div.main', evt => {
      evt.preventDefault();
      alert($(evt.currentTarget).data('restaurantId'));
    });

  }
}
