const escape = require('../utils');

class profileOrders extends ViewComponent {
  render(orders) {
    this.state = orders;
    let list = ``;
    let user = JSON.parse(sessionStorage.getItem('user'))

    for (let order of orders) {
      let items = ``;

      order.items.forEach((item) => {
        items += `<li>${escape(item.quantity)}x ${escape(item.name)}</li>`
      })

      list += `
      <div class="order listing m-2">
        <p class="order-date">${escape(order.createdAt)}</p>
        <p class="order-restaurant">${escape(order.restaurant.name)}</p>
        <ul class="order-contents">${items}</ul>
        <span class="order-status">
        <p>${escape(order.status)}</p>
        ${user.restaurants[0] ?
          `<button type="button" class="btn btn-success">Accept</button>
            <button type="button" class="btn btn-danger">Reject</button>`
          : ''}
        <p class="order-price"> ${order.priceCents.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
      </span>
      </div>
      `
    }
    return $(list);
  }
}
