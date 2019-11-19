class Login extends ViewComponent {
  render(props) {
    this.state = props;
    return $(`
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
        <input type="submit" value="Sign in" class="btn btn-warning"><input type="reset" value="Clear" class="btn btn-warning">
      </form>
    `);
  }

  componentDidMount() {

    // register form action
    const $form = this.$element.siblings('form');
    $form.on('submit', async (evt) => {
      try {
        evt.preventDefault();

        if (!$form.find('#login-username').val()) throw Error('Username cannot be blank');
        if (!$form.find('#login-password').val()) throw Error('Password cannot be blank');

        const res = await $.ajax({
          method: 'POST',
          url: '/api/users/login',
          data: $form.serialize()
        });

        if (!res.isLoggedIn) throw Error('Invalid creddentials. Please try again!');

        // bring init view into display
        window.viewManager.view('init');

      } catch (err) {
        this.$element.siblings('#login-error').text(err.message);
      }
    });
  }
}
