const escape = require('../utils');

class profileOrders extends ViewComponent {
  render(orders) {
    this.state = orders;

    let list = ``;

    for (let order of orders) {
      let items = ``;

      order.items.forEach((item, index) => {
        items += `${escape(item.quantity)}x ${escape(item.name) + (index === items.length - 1 ? '.' : ', ')}`
      })

      list += `
      <div class="order listing m-2">
        <p class="order-date">${escape(order.createdAt)}</p>
        <p class="order-restaurant">${escape(order.restaurant.name)}</p>
        <p class="order-contents">${items}</p>
        <p class="order-price">
          ${order.priceCents.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
      </div>
      `
    }
    return $(list);
  }

  componentDidMount() {
    this.$element.on('click', '#profile', (evt) => alert(this.state.username));
  }
}
