class Carousel extends ViewComponent {
  render(props) {
    let carousel = `
      <div id="img-carousel" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
          <li data-target="#img-carousel" data-slide-to="0" class="active">
          </li>
          <li data-target="#img-carousel" data-slide-to="1"></li>
          <li data-target="#img-carousel" data-slide-to="2"></li>
        </ol>
        <div class="carousel-inner">
    `;

    for (let i = 0; i < Math.min(3, props.restaurants.length); i++) {
      carousel += `
        <div class="carousel-item${!i && ' active' || ''}" data-restaurant-id="${props.restaurants[i].id}">
          <img src="${props.restaurants[i].photoUrl}" class="d-block w-100" alt="${props.restaurants[i].name}">
          <div class="carousel-caption">
            <h5>${props.restaurants[i].name}</h5>
            <p>${props.restaurants[i].description}</p>
          </div>
        </div>
      `;
    }

    carousel += `
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
    `;

    return $(carousel);
  }
}
