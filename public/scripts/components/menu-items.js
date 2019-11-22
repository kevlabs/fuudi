class MenuItems extends ViewComponent {
  render(props) {
    let list = '';

    for (let item of props.restaurant.items) {
      list += `
        <div class="menu listing m-2" data-item-id=${item.id}>
          <div class="menu-item-img rounded-circle" style="background: url('${item.photoUrl}') 50% 50% no-repeat;"></div>
          <p class="menu-title">${item.name}</p>
          <p class="menu-description">${item.description}</p>
          <p class="menu-price">
            ${(item.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </p>
          <span id='plusminus'>
          <button class='minus'> -</button>
          <span>0</span>
          <button class='add'> +</button>
          </span>
        </div>
      `;
    }

    return $(list);
  }
}
