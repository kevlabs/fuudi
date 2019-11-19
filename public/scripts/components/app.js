class App extends ViewComponent {
  render(props) {
    // store props for use in componentDidMount
    this.state = props;

    return $(`
      <header></header>
      <main></main>
      <footer></footer>
    `);
  }

  async componentDidMount() {
    try {
      const { viewManager } = this.state;
      // remove pointer to props
      this.state = null;

      const { data: user } = await xhr({
        method: 'GET',
        url: `/api/users/login`,
      }, [403]);

      // manager header views
      const header = viewManager.addViewSet($('#app > header'));
      header.addView('init', new Header());
      window.header = header;

      // manager main views
      const main = viewManager.addViewSet($('#app > main'));
      const login = new Login();
      main.addView('init', login);
      main.addView('login', login);
      main.addView('signup', new Signup());
      window.main = main;

      // display init
      viewManager.view('init', user);

    } catch (err) {
      console.log('Error in App component');
    }
  }
}
