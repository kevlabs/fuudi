class Header extends ViewComponent {
  render(props) {
    this.state = props;
    return $(`
      <div class="navbar">
        <span class="logo">Fuudi</span>
        <div class="settings-profile">
          ${props.userId && `
            <a href='#' id='profile'>
              ${props.username}
            </a>
            <a href='#'>
              Settings
            </a>
          ` || `
            <a href='#'>
              Register
            </a>
          `}
        </div>
      </div>
    `);
  }

  componentDidMount() {
    this.$element.on('click', '#profile', (evt) => alert(this.state.username));
  }
}
