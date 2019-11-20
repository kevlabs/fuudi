class Main extends ViewComponent {
  render(props) {
    this.state = props;
    let restaurants = props;

    let carousel = ``;
    let listing = ``;

    for (let i = 0; i < 3; i++) {
      carousel += `<div class="carousel-item${(i === 0 ? ' active' : '')}>
      <img src="${restaurants[i].photoUrl}" class="d-block w-100"
        alt="${restaurants[i].name}">
      <div class="carousel-caption">
        <h5>${restaurants[i].name}</h5>
        <p>${restaurants[i].description}</p>
      </div>
    </div>`
    }

    for (let restaurant of restaurants) {
      list += `
      <div class="main listing m-2">
      <p class="restaurant-title">${restaurant.name}</p>
      <p class="restaurant-location">${restaurant.streetAddress}</p>
    </div>
      `
    }

    return $(`
    <div class="content main">
    <div id='map'></div>
    <div class="carousel">
      <div id="img-carousel" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
          <li data-target="#img-carousel" data-slide-to="0" class="active">
          </li>
          <li data-target="#img-carousel" data-slide-to="1"></li>
          <li data-target="#img-carousel" data-slide-to="2"></li>
        </ol>
        <div class="carousel-inner">
          ${carousel}
        </div>
        <a class="carousel-control-prev" href="#img-carousel" role="button"
          data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#img-carousel" role="button"
          data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>

    </div>

    <div class="listing-container main-container">
      ${list};
    </div>

  </div>
    `);
  }
}
