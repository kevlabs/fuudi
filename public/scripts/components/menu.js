const escape = require('../utils');

// TODO: convert to use render()?

const menu = new ViewComponent(
  $(
    `
    <div class="content">
    <div class="profile-info">
      <div>
        <img src="${restaurant.photoUrl}" class="img-responsive header-img">
      </div>
      <div class="restaurant-info">
        <p class="profile-name">${restaurant.name}</p>
        <p class="restaurant-description font-italic">
          ${restaurant.description}</p>
        <p class="restaurant-hours">${restaurant.openTime}</p>
        <p class="restaurant-hours">${restaurant.closeTime}</p>
        <p class="restaurant-ratings">Rating: ${restaurant.rating}/5</p>
      </div>
    </div>

    <div class="listing-container">

    </div>

      `
  )
);
