class Signup extends ViewComponent {
  render(props, cancel) {

    // if user already logged in change view
    if (props.user.isLoggedIn) {
      cancel();
      return props.viewManager.view('user-profile', { user: props.user });
    }

    this.state = props;

    return $(`
      <div class="login-container">
        <span class="title-container"><h3>Register</h3></span>
        <div id="signup-error" class="help-block"></div>
        <form class="login-form" action="/api/users/" method="POST">
          <div class="form-group">
            <label for="signup-username">Username</label>
            <input id="signup-username" name="username" type="text" class="form-control">
          </div>
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input id="signup-email" name="email" type="email" class="form-control">
          </div>
          <div class="form-group">
            <label for="signup-phone">Phone number</label>
            <input id="signup-phone" name="phone" type="text" class="form-control">
          </div>
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" class="form-control">
          </div>
          <div class="signup-buttons">
            <input type="submit" value="Sign up" class="btn btn-outline-dark">
            <input type="reset" value="Clear" class="btn btn-outline-dark">
          </div>
        </form>
      </div>
    `);
  }

  componentDidMount() {

    // register form action
    const $form = this.$element.find('form');
    $form.on('submit', async (evt) => {
      try {
        evt.preventDefault();

        // clear error container
        this.$element.find('#signup-error').removeAttr('data-error');
        this.$element.find('#signup-error').text('');

        const username = $form.find('#signup-username').val();
        if (!username) throw Error('Username cannot be blank');
        if (!isUsername(username)) throw Error('Username is invalid');
        const email = $form.find('#signup-email').val();
        if (!email) throw Error('Email cannot be blank');
        if (!isEmail(email)) throw Error('Email is invalid');
        if (!$form.find('#signup-phone').val()) throw Error('Phone number cannot be blank');
        if (!$form.find('#signup-password').val()) throw Error('Password cannot be blank');

        const { data: user, jqXHR: { status } } = await xhr({
          method: 'POST',
          url: '/api/users/',
          data: $form.serialize()
        }, [404]);

        if (status !== 200) throw Error(user.error);
        if (!user.isLoggedIn) throw Error('Invalid credentials. Please try again!');

        // bring init view into display
        window.viewManager.view('init', { user });

      } catch (err) {
        this.$element.find('#signup-error').attr('data-error', err.message);
        this.$element.find('#signup-error').text(err.message);
      }
    });

    $form.on('reset', (evt) => {
      // clear error container
      this.$element.find('#signup-error').removeAttr('data-error');
      this.$element.find('#signup-error').text('');

    });
  }
}
