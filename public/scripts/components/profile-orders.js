class ProfileOrders extends ViewComponent {
  render({ orders, isRestaurant }) {
    let list = ``;

    !orders.length && (list = '<p>No orders have been made. Time to step up your game 🤩...</p>');

    for (let order of orders) {
      const items = order.items.map((item) => `<li>${escape(item.quantity)}x ${escape(item.name)}</li>`).join('');

      list += `
        <div class="order listing m-2">
          <p class="order-date">${toDateString(new Date(order.created))}</p>
          <p class="order-restaurant">${escape(order.restaurant.name)}</p>
          <ul class="order-contents">${items}</ul>
          <span class="order-status">
            <p>${escape(order.status)}</p>
            ${isRestaurant && `
              <button type="button" class="btn btn-success">Accept</button>
              <button type="button" class="btn btn-danger">Reject</button>
            ` || ''}
            <p class="order-price"> ${(order.totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          </span>
        </div>
      `;

    }

    return $(list);
  }
}
