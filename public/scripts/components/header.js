class Header extends ViewComponent {
  render(props) {
    this.state = props;

    return $(`
      <nav class="navbar">
        <span class="icon" title="Go to Fuudi's home" aria-label="Fuudi"><p>F</p></span>
        <span class="logo"title="Go to Fuudi's home" aria-label="Fuudi"><p>Fuudi</p></span>
        <ul class="settings-profile">
          ${props.user.isLoggedIn && `
            ${props.user.restaurants && props.user.restaurants[0] && `
              <li id="header-restaurant-profile">
                <a href="#">
                  <i class="fas fa-utensils" title="My restaurant" aria-label="My restaurant"></i>
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
                <i class="fas fa-user" title="My profile" aria-label="My profile"></i>
              </a>
            </li>
            <li id="header-signout">
              <a href="#">
                <i class="fas fa-sign-out-alt" title="Sign me out" aria-label="Sign me out"></i>
              </a>
            </li>
          ` || `
            <li id="header-signup">
              <a href="#">
                <i class="fas fa-user-plus" title="Register" aria-label="Register"></i>
              </a>
            </li>
            <li id="header-signin">
              <a href="#">
                <i class="fas fa-sign-in-alt" title="Sign me in" aria-label="Sign me in"></i>
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
    const main = window.main;

    // remove pointer to props
    this.state = null;

    // store user info
    sessionStorage.setItem('user', JSON.stringify(user));

    // handle logo clicks
    this.$element.on('click', '.logo > p, .icon', (evt) => {
      evt.preventDefault();
      main.view('home', { user });
    });

    this.$element.on('click', '.settings-profile li', async (evt) => {
      evt.preventDefault();

      // handle sign up clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signup'))) {
        main.view('signup', { user });
      }

      // handle sign in clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signin'))) {
        main.view('login', { user });
      }

      // handle restaurant profile clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-restaurant-profile'))) {
        main.view('restaurant-profile', { user, isRestaurant: true });
      }

      // handle profile clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-profile'))) {
        main.view('user-profile', { user, isRestaurant: false });
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
