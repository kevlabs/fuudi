class App extends ViewComponent {
  render(props) {
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

      const user = await $.ajax({
        method: 'GET',
        url: `/api/users/login`,
      });

      // manager header views
      const header = viewManager.addViewSet($('#app > header'));
      header.addView('init', new Header());
      window.header = header;

      // manager main views
      const main = viewManager.addViewSet($('#app > main'));
      main.addView('init', new Login());
      window.main = main;

      // display init
      viewManager.view('init', user);

    } catch (err) {
      console.log('Error in App component');
    }
  }
}
