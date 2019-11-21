$(document).ready(function () {
  const $cart = [];
  const cartToHTML = {}; //const ?
  console.log("document loaded");

  // handle cart +
  $(".add").click(function () {

    // grabbing menu item name
    const $plusminus = ($(this).closest("#plusminus")).siblings(".menu-title");
    const $item = $plusminus.html();
    // push to items
    $cart.push($item);

    // add to table if not there yet
    if (!cartToHTML[$item]) {
      cartToHTML[$item] = {};
      cartToHTML[$item].id = $(this).closest(".listing").attr("data-item-id");
      cartToHTML[$item].quantity = 1;
      cartToHTML[$item].price = parseFloat(($(this).closest("#plusminus")).siblings(".menu-price").html().replace('$', ''));

    } else {
      // if exists update quantity
      cartToHTML[$item].quantity += 1;
    }

    // display checkout container
    $(".checkout").addClass("display");
    $(".checkout").slideDown();

    // get quantity input
    let $quantity = $(this).closest("span").find("span").html();
    $quantity = parseInt($quantity);
    $quantity += 1;
    $(this).closest("span").find("span").html($quantity);
    console.log(cartToHTML);
  });

  // handle cart -
  $(".minus").click(function() {

    let $quantity = $(this).closest("span").find("span").html();

    // check that quantity is positive before decrementing
    if ($quantity) {
      // grabbing menu item name
      const $plusminus = ($(this).closest("#plusminus")).siblings(".menu-title");
      const $item = $plusminus.html();

      $quantity = $(this).closest("span").find("span").html();
      $quantity = parseInt($quantity);
      $quantity -= 1;

      if ($quantity === 0) {
        delete cartToHTML[$item];
      } else {
        cartToHTML[$item].quantity -= 1;
      }
      // update html
      $(this).closest("span").find("span").html($quantity);

      // if no items left in cart, remove checkout button
      if (Object.keys(cartToHTML).length === 0) {
        $(".checkout").removeClass("display");
        $(".checkout").slideToggle();

      }
    }
  });

  // cart display
  $('.checkout').click(function() {
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
    $('<button id="buy" type="button">Click Me!</button>').appendTo('tbody').click(function() {
      let JSONorder = {};
      let userInfo = JSON.parse(sessionStorage.getItem('user'));
      console.log(userInfo);

      // get restaurant id from props
      // (userInfo.restaurants) && JSONorder.restaurantId = userInfo.restaurants[0]; //get from this.state
      // }

      JSONorder.total = calculateTotal(cartToHTML);
      JSONorder.items = [];
      for (const item of Object.values(cartToHTML)) {
        const itemObject = {};
        itemObject.id = item.id;
        itemObject.quantity = item.quantity;
        JSONorder.items.push(itemObject);
      }
      JSON.stringify(JSONorder);
      console.log(JSONorder);
    });
  });

});

/*
NEW ORDERS - JSON input format:
{
  "restaurantId": "1",
  "total": "1520",
  "items": [
    {
      "id": "1",
      "quantity": "4"
    },
    {
      "id": "7",
      "quantity": "1"
    },
    {
      "id": "27",
      "quantity": "1"
    }
  ]
}

*/
