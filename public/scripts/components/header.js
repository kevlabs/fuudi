class Header extends ViewComponent {
  render(props) {

    return $(`
      <nav class="navbar">
        <span class="logo">Fuudi</span>
        <div class="settings-profile">
          ${props.isLoggedIn && `
            <a href="#" id="header-profile">
              <i class="fas fa-user"></i>
            </a>
            <a href="#" id="header-signout">
              <i class="fas fa-sign-out-alt"></i>
            </a>
          ` || `
            <a href="#" id="header-signup">
              <i class="fas fa-user-plus"></i>
            </a>
            <a href="#" id="header-signin">
              <i class="fas fa-sign-in-alt"></i>
            </a>
            `}
        </div>
      </nav>
      `);
  }

  componentDidMount() {

    this.$element.on('click', '.settings-profile a', async (evt) => {
      evt.preventDefault();

      // handle sign up clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signup'))) {
        // alert('Clicked signup');
        window.viewManager.view('signup');
      }

      // handle sign in clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signin'))) {
        window.viewManager.view('login');
      }

      // handle profile clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-profile'))) {
        alert('Clicked profile');
      }

      // handle sign out clicks
      if ($(evt.currentTarget).is(this.$element.find('#header-signout'))) {

        const { data: user } = xhr({
          method: 'GET',
          url: '/api/users/logout'
        });

        window.viewManager.view('init', user);
      }

    });


    this.$element.on('click', '#profile', (evt) => alert(this.state.username));
  }
}
