const escape = require('../utils');

class menuItems extends ViewComponent {
  render(items) {
    this.state = items;

    let list = ``;

    for (let item of items) {
      list += `
      <div class="menu listing m-2">
      <p class="menu-title">${item.name}</p>
      <p class="menu-description">${item.description}</p>
      <p class="menu-price">
        ${item.priceCents.toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </p>
    </div>
      `
    }
    return $(list);
  }
}
