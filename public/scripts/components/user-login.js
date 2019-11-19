class Login extends ViewComponent {
  render(props, cancel) {
    this.state = props;

    // if user already logged in change view
    // props.isLoggedIn && cancel();
    // viewManager.view('init');

    return $(`
      <span class="title-container"><h3>Log In</h3></span>
      <div id="login-error" class="help-block"></div>
      <form action="/api/users/login" method="POST">
        <div class="form-group">
          <label for="login-username">Username</label>
          <input id="login-username" name="username" type="text" class="form-control">
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input id="login-password" name="password" type="password" class="form-control">
        </div>
        <div class="login-buttons">
          <input type="submit" value="Sign in" class="btn btn-outline-dark">
          <input type="reset" value="Clear" class="btn btn-outline-dark">
        </div>
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
        this.$element.siblings('#login-error').text('');

        if (!$form.find('#login-username').val()) throw Error('Username cannot be blank');
        if (!$form.find('#login-password').val()) throw Error('Password cannot be blank');

        const { data: user } = await xhr({
          method: 'POST',
          url: '/api/users/login',
          data: $form.serialize()
        }, [403]);

        if (!user.isLoggedIn) throw Error('Invalid credentials. Please try again!');

        // store user info
        // sessionStorage.setItem('user', JSON.stringify(user));

        // bring init view into display
        window.viewManager.view('init', user);

      } catch (err) {
        this.$element.siblings('#login-error').text(err.message);
      }
    });
  }
}
