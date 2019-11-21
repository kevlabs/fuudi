class Profile extends ViewComponent {
  render(props) {

    this.state = props;
    const restaurant = props.restaurant;

    return $(`
      <div class="user-img rounded-circle" style="background: url(${restaurant && `${restaurant.photoUrl}` || `../../imgs/profile-hex.png`}) 50% 50% no-repeat;">
      </div>
      ${restaurant && `
        <p class="profile-name">${restaurant.name}</p>
        <p class="user-details">Email: ${restaurant.email}</p>
        <p class="user-details">Phone: ${restaurant.phone}</p>
        <p class="user-details">Address: ${restaurant.streetAddress}<br/>${restaurant.city}, ${restaurant.postCode}</p>
      ` || `
        <p class="profile-name">${props.user.username}</p>
        <p class="user-details">Email: ${props.user.email}</p>
        <p class="user-details">Phone: ${props.user.phone}</p>
      `}
    </div>
    `);
  }
}
