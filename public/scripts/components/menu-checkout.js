class MenuCheckout extends ViewComponent {
  render(props) {
    this.state = props;
    return $(`
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" id="item-number">#</th>
            <th scope="col" id="item-name">Item</th>
            <th scope="col" id="item-price">Price</th>
            <th scope="col" id="item-quantity">Quantity</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `);
  }

  componentDidMount() {

    // viewManager required to redirect to profile page once order submitted
    const main = this.state.mainViewManager;
    const restaurant = this.state.restaurant;

    const $cart = [];
    let cartToHTML = {}; //const ?

    // handle cart +
    $(".add").click((evt) => {
      evt.preventDefault();
      const $elem = $(evt.currentTarget);

      // grabbing menu item name
      const $plusminus = ($elem.closest("#plusminus")).siblings(".menu-title");
      const $item = $plusminus.html();
      // push to items
      $cart.push($item);

      // add to table if not there yet
      if (!cartToHTML[$item]) {
        cartToHTML[$item] = {};
        cartToHTML[$item].id = $elem.closest(".listing").attr("data-item-id");
        cartToHTML[$item].quantity = 1;
        cartToHTML[$item].price = parseFloat(($elem.closest("#plusminus")).siblings(".menu-price").html().replace('$', ''));

      } else {
        // if exists update quantity
        cartToHTML[$item].quantity += 1;
      }

      // display checkout container
      $(".checkout").animate({ bottom: 0 }, 1000);

      // get quantity input
      let $quantity = $elem.closest("span").find("span").html();
      $quantity = parseInt($quantity);
      $quantity += 1;
      $elem.closest("span").find("span").html($quantity);

    });

    // handle cart -
    $(".minus").click((evt) => {
      evt.preventDefault();
      const $elem = $(evt.currentTarget);

      let $quantity = $elem.closest("span").find("span").html();

      // check that quantity is positive before decrementing
      if ($quantity) {
        // grabbing menu item name
        const $plusminus = ($elem.closest("#plusminus")).siblings(".menu-title");
        const $item = $plusminus.html();

        $quantity = $elem.closest("span").find("span").html();
        $quantity = parseInt($quantity);
        $quantity -= 1;

        if ($quantity === 0) {
          delete cartToHTML[$item];
        } else {
          cartToHTML[$item].quantity -= 1;
        }
        // update html
        $elem.closest("span").find("span").html($quantity);

        // if no items left in cart, remove checkout button
        if (Object.keys(cartToHTML).length === 0) {
          $(".checkout").animate({ bottom: '-50px' }, 1000);
        }
      }
    });

    // cart display
    $('.checkout').click(async (evt) => {
      evt.preventDefault();
      $('tbody').empty();
      $('#buy').remove();

      // render hmlt
      let i = 1;
      for (const item of Object.keys(cartToHTML)) {
        const totalTable = `
          <tr>
            <th scope="row">${i}</th>
            <td>${item}</td>
            <td>${cartToHTML[item].price}</td>
            <td>${cartToHTML[item].quantity}</td>
          </tr>
        `;
        $("tbody").append(totalTable);
        i++;
      }

      let totalPriceWithTax = `
        <tr>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col">Total</th>
          <th scope="col">Taxes</th>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td>${(calculateTotal(cartToHTML) * 1.13).toFixed(2)}</td>
          <td>${(calculateTotal(cartToHTML) * .13).toFixed(2)}</td>
        </tr>
      `;
      $("tbody").append(totalPriceWithTax);

      // add buy button
      $(`
        <button id="buy" class="btn btn-success" type="button">
          <span id="checkout-button">
            <p>Total Price: $${(calculateTotal(cartToHTML) * 1.13).toFixed(2)}.</p>
            <p> Checkout!</p>
          </span>
        </button>
      `).appendTo('.overlay').click(async (evt) => {
        evt.preventDefault();

        const JSONorder = {};

        // get restaurant id from state
        JSONorder.restaurantId = restaurant.id;

        JSONorder.total = (calculateTotal(cartToHTML) * 100).toFixed();
        JSONorder.items = [];
        for (const item of Object.values(cartToHTML)) {
          const itemObject = {};
          itemObject.id = item.id;
          itemObject.quantity = item.quantity;
          JSONorder.items.push(itemObject);
        }

        try {
          // submit order
          const { data: order } = await xhr({
            method: 'POST',
            url: '/api/orders/',
            dataType: 'json',
            data: JSONorder
          });

          if (order.length !== 1) throw Error('Could not place order.');

          // redirect to profile/order history page
          main.view('user-profile', { user: this.state.user });

        } catch (err) {
          this.$element.siblings('.error-container').text(err.message);
        }

      });
    });

    // Minimize Cart

    $('#minimize-checkout').click((evt) => {
      evt.preventDefault();

      $('.overlay').animate({ bottom: '-800px' }, 1000);
      $('#buy').remove();
    });
  }
}
