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
              <form data-order-id="${order.id}" id="form-${order.id}" action="/api/orders/${order.id}" method="POST">
                <span>
                  <label for="minutes">Wait time (minutes)</label>
                  <input type="text" name ="minutes" value="${restaurant.waitMinutes}">
                </span>
                <button type="submit" name="${order.id}" id="accept-${order.id}" class="btn   btn-success">Accept</button>
                <button type="submit" id="reject-${order.id}" class="btn btn-danger">Reject</button>
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

        // Check which button was clicked
        let clickedButton = $("button[type=submit][clicked=true]").text();


        if (clickedButton === "Accept") {

          // Order accepted

          let orderId = $(evt.currentTarget).data('orderId');
          let waitMinutes = evt.currentTarget[0].value;

          let data = {
            status: 'In Progress',
            waitMinutes: Number(waitMinutes)
          }

          $(`#form-${orderId}`).empty();
          $(`#form-${orderId}`).append(
            `<p id=order-timer-${orderId}>TimeRemaining: ${waitMinutes}</p>`
          );
          $(`#form-${orderId}`).append(
            `<button type="submit" name="${orderId}" id="accept-${orderId}" class="btn   btn-success">Complete Order</button>`
          );

          //Assigning listener to new button to assign clicked status

          $("form button[type=submit]").click(function () {
            $("button[type=submit]", $(this).parents("form")).removeAttr("clicked");
            $(this).attr("clicked", "true");
          });

          console.log(JSON.stringify(data));

          const { data: order } = await xhr({
            method: 'PUT',
            url: `/api/orders/${orderId}`,
            dataType: "json",
            data: JSON.stringify(data)
          });

        } else if (clickedButton === "Reject") {

          // Order rejected

          let orderId = $(evt.currentTarget).data('orderId');

          let data = {
            status: 'Rejected',
            waitMinutes: null
          }

          $(`#form-${orderId}`).remove();

          const { data: order } = await xhr({
            method: 'PUT',
            url: `/api/orders/${orderId}`,
            dataType: "json",
            data: JSON.stringify(data)
          });

        } else if (clickedButton === "Complete Order") {

          // Order completed

          let orderId = $(evt.currentTarget).data('orderId');

          let data = {
            status: 'Completed',
            waitMinutes: null
          }

          $(`#form-${orderId}`).remove();

          const { data: order } = await xhr({
            method: 'PUT',
            url: `/api/orders/${orderId}`,
            dataType: "json",
            data: JSON.stringify(data)
          });
        }


      });

      $("form button[type=submit]").click(function () {
        $("button[type=submit]", $(this).parents("form")).removeAttr("clicked");
        $(this).attr("clicked", "true");
      });

    } catch (err) {
      console.log("here");
      this.$element.siblings('#profile-error').text(err.message);
    }
  }

}

