class ProfileOrders extends ViewComponent {
  render({ orders, restaurant }) {
    let list = ``;
    let i = 0;
    const isRestaurant = Boolean(restaurant);

    !orders.length && (list = '<p>No orders have been made. Time to step up your game 🤩...</p>');

    for (let order of orders) {
      const items = order.items.map((item) => `<li>${escape(item.quantity)}x ${escape(item.name)}</li>`).join('');

      list += `
        <div class="order listing m-2">
          <p class="order-date">${toDateString(new Date(order.created))}</p>
          <p class="order-restaurant">${escape(order.restaurant.name)}</p>
          <ul class="order-contents">${items}</ul>
          <span class="order-status">
            <p id="order-status-${i}">${escape(order.status)}</p>
            ${isRestaurant && `
              <button type="button" id="accept-${i}" class="btn btn-success" onclick="setWaitTime(${restaurant.waitMinutes}, ${i})">Accept</button>
              <button type="button" id="reject-${i}" class="btn btn-danger">Reject</button>
            ` || ''}
            <p class="order-price"> ${(order.totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          </span>
        </div>
      `;

      i++;

    }

    return $(list);
  }

  // async componentDidMount() {
  //   try {
  //     const setWaitTime = () => {
  //       const waitTime = prompt("Please set estimated wait time in minutes:", `${restaurant.waitMinutes}`);
  //     }
  //   } catch (err) {
  //     this.$element.siblings('#profile-error').text(err.message);
  //   }
  // }

}

