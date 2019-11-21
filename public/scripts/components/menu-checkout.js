class MenuCheckout extends ViewComponent {
  render(props) {
    this.state = props;
    return $(`
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Item</th>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
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
    const cartToHTML = {}; //const ?
    console.log("document loaded");

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
      $(".checkout").addClass("display");
      $(".checkout").slideDown();

      // get quantity input
      let $quantity = $elem.closest("span").find("span").html();
      $quantity = parseInt($quantity);
      $quantity += 1;
      $elem.closest("span").find("span").html($quantity);
      console.log(cartToHTML);
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
          $(".checkout").removeClass("display");
          $(".checkout").slideToggle();

        }
      }
    });

    // cart display
    $('.checkout').click(async (evt) => {
      evt.preventDefault();
      console.log(calculateTotal(cartToHTML));

      $('.overlay').toggle();
      $('tbody').empty();

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
      $('<button id="buy" type="button">Click Me!</button>').appendTo('tbody').click(async (evt) => {
        evt.preventDefault();
        const JSONorder = {};

        // get restaurant id from state
        JSONorder.restaurantId = restaurant.id;

        JSONorder.total = calculateTotal(cartToHTML) * 100;
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
          console.log(err);

          this.$element.siblings('.error-container').text(err.message);
        }

      });
    });



  }
}
