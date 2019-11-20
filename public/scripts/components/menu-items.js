const escape = require('../utils');

class menuItems extends ViewComponent {
  render(items) {
    this.state = items;

    let list = ``;

    for (let item of items) {
      list += `
      <div class="menu listing m-2" data-item-id=${item.id}>
      <p class="menu-title">${item.name}</p>
      <p class="menu-description">${item.description}</p>
      <p class="menu-price">
        ${(item.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </p>
      <span id='plusminus'>
      <button class='minus'> -</button>
      <span>0</span>
      <button class='add'> +</button>
    </span>
    </div>
      `
    }
    return $(list);
  }
}
