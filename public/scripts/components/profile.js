const profile = new ViewComponent(
  $(`
   <div class="content">
    <div class="profile-info">
      <div class="user-img">
        <img src="${user.photoUrl}"
          class="profile-picture img-responsive rounded-circle">
      </div>
      <p class="profile-name">${user.username}</p>
      <p class="user-details">Email: ${user.email}</p>
      <p class="user-details">Phone: ${user.phone}</p>
    </div>

    <div class="listing-container">

    </div>

  `)
);
