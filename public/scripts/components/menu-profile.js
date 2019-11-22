class MenuProfile extends ViewComponent {
  render(props) {
    const restaurant = props.restaurant;

    return $(`
      <div>
        <img src="${restaurant.photoUrl}" class="img-responsive header-img">
      </div>
      <div class="restaurant-info">
        <p class="profile-name">${restaurant.name}</p>
        <p class="restaurant-description font-italic">
          ${restaurant.description}</p>
        <p class="restaurant-hours">${restaurant.openTime}</p>
        <p class="restaurant-hours">${restaurant.closeTime}</p>
        <p class="restaurant-ratings">Yelp Rating: <a href="${restaurant.ratingUrl}" target="_blank" title="Check out the restaurant's Yelp profile">${restaurant.rating / 10}/5</a></p>
      </div>
    `);
  }

}
