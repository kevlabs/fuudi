$(document).ready(function () {

  console.log("document loaded");
  $(".add").click(function () {
    $(".checkout").addClass("display");
    $( ".checkout" ).slideDown();
    $quantity = $(this).closest("span").find("span").html();
    $quantity = parseInt($quantity);
    $quantity += 1;
    console.log($quantity);
    $(this).closest("span").find("span").html($quantity);
  });
  $(".minus").click(function () {
    if ($(this).closest("span").find("span").html() > 0) {
      $quantity = $(this).closest("span").find("span").html();
      $quantity = parseInt($quantity);
      $quantity -= 1;
      console.log($quantity);
      $(this).closest("span").find("span").html($quantity);
    }
  });
});

