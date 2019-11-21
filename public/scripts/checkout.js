$(document).ready(function () {
  $cart = [];
  let cartToHTML = {};
  console.log("document loaded");
  $(".add").click(function () {
    $plusminus = ($(this).closest("#plusminus")).siblings(".menu-title");
    $item = $plusminus.html();
    $cart.push($item);
    if (!cartToHTML[$item]) {
      cartToHTML[$item] = {};
      cartToHTML[$item].id = $(this).closest(".listing").attr("data-item-id");
      cartToHTML[$item].quantity = 1;
      cartToHTML[$item].price = parseFloat(($(this).closest("#plusminus")).siblings(".menu-price").html().replace('$', ''));
    } else {
      cartToHTML[$item].quantity += 1;
    }
    $(".checkout").addClass("display");
    $(".checkout").slideDown();
    $quantity = $(this).closest("span").find("span").html();
    $quantity = parseInt($quantity);
    $quantity += 1;
    $(this).closest("span").find("span").html($quantity);
    console.log(cartToHTML);
  });

  $(".minus").click(function () {
    if ($(this).closest("span").find("span").html() > 0) {
      $plusminus = ($(this).closest("#plusminus")).siblings(".menu-title");
      $item = $plusminus.html();
      $quantity = $(this).closest("span").find("span").html();
      $quantity = parseInt($quantity);
      $quantity -= 1;
      if ($quantity === 0) {
        delete cartToHTML[$item];
      } else {
        cartToHTML[$item].quantity -= 1;

      }

      $(this).closest("span").find("span").html($quantity);

      if (Object.keys(cartToHTML).length == 0) {
        $(".checkout").removeClass("display");
        $(".checkout").slideToggle();

      }
    }
  });

  $(".checkout").click(function () {
    console.log(calculateTotal(cartToHTML));
    $(".overlay").toggle();
    $("tbody").empty();
    for (let item of Object.keys(cartToHTML)) {
      let i = 1;
      let totalTable = `
      <tr>
        <th scope="row">${i}</th>
        <td>${item}</td>
        <td>${cartToHTML[item].price}</td>
        <td>${cartToHTML[item].quantity}</td>
      </tr>`;
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
    `
    $("tbody").append(totalPriceWithTax);
    let $buyButton = `<button id="buy" class="btn btn-success" type="button">Click Me!</button>`
    $("tbody").append($buyButton);

    $("#buy").click(function () {
      let JSONorder = {};
      let userInfo = JSON.parse(sessionStorage.getItem('user'));
      console.log(userInfo);
      if (userInfo.restaurants) {
        JSONorder.restaurantId = userInfo.restaurants[0];
      }
      JSONorder.total = calculateTotal(cartToHTML);
      JSONorder.items = [];
      for (item of Object.keys(cartToHTML)) {
        let itemObject = {};
        itemObject.id = cartToHTML[item].id;
        itemObject.quantity = cartToHTML[item].quantity;
        JSONorder.items.push(itemObject);
      }
      JSON.stringify(JSONorder);
      console.log(JSONorder);
    });
  });




});
function calculateTotal(object) {
  let total = 0;
  for (item of Object.keys(object)) {
    total += object[item].price * object[item].quantity;
  }
  return total;
}


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
