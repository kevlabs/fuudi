$(document).ready(function () {
  $cart = [];
  let cartToHTML = {};
  console.log("document loaded");
  $(".add").click(function () {
    $plusminus = ($(this).closest("#plusminus")).siblings(".menu-title");
    $item = $plusminus.html();
    $cart.push($item);
    if(!cartToHTML[$item]){
      cartToHTML[$item] = {};
      cartToHTML[$item].quantity = 1;
      cartToHTML[$item].price = parseFloat(($(this).closest("#plusminus")).siblings(".menu-price").html().replace('$',''));
    } else{
      cartToHTML[$item].quantity += 1;
    }
    $(".checkout").addClass("display");
    $( ".checkout" ).slideDown();
    $quantity = $(this).closest("span").find("span").html();
    $quantity = parseInt($quantity);
    $quantity += 1;
    $(this).closest("span").find("span").html($quantity);
  });

  $(".minus").click(function () {
    if ($(this).closest("span").find("span").html() > 0) {
      $plusminus = ($(this).closest("#plusminus")).siblings(".menu-title");
      $item = $plusminus.html();
      $quantity = $(this).closest("span").find("span").html();
      $quantity = parseInt($quantity);
      $quantity -= 1;
      if($quantity === 0){
        delete cartToHTML[$item];
      } else {
        cartToHTML[$item].quantity -= 1;

      }

      $(this).closest("span").find("span").html($quantity);

      if(Object.keys(cartToHTML).length == 0){
        $(".checkout").removeClass("display");
        $( ".checkout" ).slideToggle();

      }
    }
  });

  $(".checkout").click(function () {
    $(".overlay").toggle();
    for(let item of Object.keys(cartToHTML)){
      console.log(item);
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

  });
  

});


