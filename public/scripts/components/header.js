class Header extends ViewComponent {
  render(props) {
    this.state = props;

    return $(`
      <nav class="navbar">
        <span class="icon"><p>F</p></span>
        <span class="logo"><p>Fuudi</p></span>
        <ul class="settings-profile">
          ${props.user.isLoggedIn && `
            ${props.user.restaurants && props.user.restaurants[0] && `
              <li id="header-restaurant-profile">
                <a href="#">
                  <i class="fas fa-utensils"></i>
                </a>
              </li>
              <li id="header-restaurant-settings">
                <a href="#">
                  <i class="fas fa-cog"></i>
                </a>
              </li>
            ` || ''}
            <li id="header-profile">
              <a href="#">
                <i class="fas fa-user"></i>
              </a>
            </li>
            <li id="header-signout">
              <a href="#">
                <i class="fas fa-sign-out-alt"></i>
              </a>
            </li>
          ` || `
            <li id="header-signup">
              <a href="#">
                <i class="fas fa-user-plus"></i>
              </a>
            </li>
            <li id="header-signin">
              <a href="#">
                <i class="fas fa-sign-in-alt"></i>
              </a>
            </li>
            `}
        </ul>
      </nav>
      `);
  }

  componentDidMount() {

    // grab user info
    const user = this.state.user;

    // remove pointer to props
    this.state = null;

    // store user info
    sessionStorage.setItem('user', JSON.stringify(user));

    // handle logo clicks
    this.$element.on('click', '.logo > p, .icon', (evt) => {
      evt.preventDefault();
      window.viewManager.view('home', { user });
    });


    this.$element.on('click', '.settings-profile li', async (evt) => {
      evt.preventDefault();

      // handle sign up clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signup'))) {
        // alert('Clicked signup');
        window.viewManager.view('signup', { user });
      }

      // handle sign in clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signin'))) {
        window.viewManager.view('login', { user });
      }

      // handle restaurant profile clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-restaurant-profile'))) {


        const { data } = await xhr({
          method: 'GET',
          url: `/api/restaurants/${user.restaurants[0]}`
        });

        if (!data.length) throw Error('Restaurant not found');

        const [restaurantInfo] = data;

        window.main.view('restaurant-profile', { user, restaurantInfo });
      }

      // handle profile clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-profile'))) {
        window.main.view('user-profile', { user });
      }

      // handle sign out clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signout'))) {

        const { data: user } = await xhr({
          method: 'GET',
          url: '/api/users/logout'
        });

        window.viewManager.view('init', { user });
      }

    });

  }
}
