class ProfileOrders extends ViewComponent {
  render({ orders, restaurant }) {
    let list = ``;
    const isRestaurant = Boolean(restaurant);

    !orders.length && (list = '<p>No orders have been made. Time to step up your game 🤩...</p>');

    for (let order of orders) {
      const items = order.items.map((item) => `<li>${escape(item.quantity)}x ${escape(item.name)}</li>`).join('');

      list += `
        <div class="order listing m-2" data-order-id="${order.id}">
          <p class="order-date">${toDateString(new Date(order.created))}</p>
          <p class="order-restaurant">${escape(order.restaurant.name)}</p>
          <ul class="order-contents">${items}</ul>
          <span class="order-status">
            <p id="order-status-${order.id}">${escape(order.status)}</p>
            ${isRestaurant && `
              <form data-order-id="${order.id}" action="/api/orders/${order.id}" method="POST">
                <label for="minutes">Wait time (minutes)</label>
                <input type="text" name ="minutes" value="${restaurant.waitMinutes}">
                <button type="submit" name="${order.id}" id="accept-${order.id}" class="btn   btn-success">Accept</button>
                <button type="button" id="reject-${order.id}" class="btn btn-danger">Reject</button>
              </form>

            ` || ''}
            <p class="order-price"> ${(order.totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          </span>
        </div>
      `;

    }

    return $(list);
  }

  async componentDidMount() {
    try {
      $(".order-status form").submit(async (evt) => {
        evt.preventDefault();
        let orderId = $(evt.currentTarget).data('orderId');
        let waitMinutes = evt.currentTarget[0].value;
        console.log(waitMinutes);

        let data = {
          status: 'In Progress',
          waitMinutes
        }

        const { data: order } = await xhr({
          method: 'PUT',
          url: `/api/orders/${orderId}`,
          data: JSON.stringify(data)
        }, [403]);

      });
    } catch (err) {
      this.$element.siblings('#profile-error').text(err.message);
    }
  }

}

