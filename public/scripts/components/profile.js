const escape = require('../utils');

// TODO: convert to use render()?

const profile = new ViewComponent(
  $(
    `
       <div class="content">
        <div class="profile-info">
          <div class="user-img">
            <img src="${escape(user.photoUrl)}"
              class="profile-picture img-responsive rounded-circle">
          </div>
          <p class="profile-name">${escape(user.username)}</p>
          <p class="user-details">Email: ${escape(user.email)}</p>
          <p class="user-details">Phone: ${escape(user.phone)}</p>
        </div>

        <div class="listing-container">

        </div>

      `
  )
);
