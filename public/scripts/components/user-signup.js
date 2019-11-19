class Signup extends ViewComponent {
  render(props, cancel) {
    this.state = props;

    // if user already logged in change view
    // props.isLoggedIn && cancel();
    // viewManager.view('init');

    return $(`
      <div id="signup-error" class="help-block"></div>
      <form action="/api/users/signup" method="POST">
        <div class="form-group">
          <label for="signup-username">Username</label>
          <input id="signup-username" name="username" type="text" class="form-control">
        </div>
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input id="signup-email" name="email" type="text" class="form-control">
        </div>
        <div class="form-group">
          <label for="signup-phone">Phone number</label>
          <input id="signup-phone" name="email" type="text" class="form-control">
        </div>
        <div class="form-group">
          <label for="signup-password">Password</label>
          <input id="signup-password" name="password" type="password" class="form-control">
        </div>
        <input type="submit" value="Sign up" class="btn btn-warning"><input type="reset" value="Clear" class="btn btn-warning">
      </form>
    `);
  }

  componentDidMount() {

    // register form action
    const $form = this.$element.siblings('form');
    $form.on('submit', async (evt) => {
      try {
        evt.preventDefault();

        // clear error container
        this.$element.siblings('#signup-error').text('');

        if (!$form.find('#signup-username').val()) throw Error('Username cannot be blank');
        const email = $form.find('#signup-email').val();
        if (!email) throw Error('Email cannot be blank');
        if (isEmail(email)) throw Error('Email is invalid');
        if (!$form.find('#signup-phone').val()) throw Error('Phone number cannot be blank');
        if (!$form.find('#signup-password').val()) throw Error('Password cannot be blank');

        const { data: user } = await xhr({
          method: 'POST',
          url: '/api/users/',
          data: $form.serialize()
        }, [403]);

        if (!user.isLoggedIn) throw Error('Invalid creddentials. Please try again!');

        // store user info
        sessionStorage.setItem('user', JSON.stringify(user));

        // bring init view into display
        window.viewManager.view('init', user);

      } catch (err) {
        this.$element.siblings('#signup-error').text(err.message);
      }
    });
  }
}
