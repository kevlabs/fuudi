// Function to escape inputs to prevent Cross-Site Scripting

const escape = function (str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// $.ajax wrapper so that specific response statuses can be handled in the then/try block
const xhr = (ajaxOptions, validStatuses = []) => {
  return new Promise((resolve, reject) => {
    $.ajax(ajaxOptions)
      .then((data, textStatus, jqXHR) => resolve({ data: jqXHR.responseJSON, jqXHR }))
      .fail((jqXHR, textStatus, errorThrown) => {
        // resolve is error status is in validStatuses
        if (validStatuses.includes(jqXHR.status)) return resolve({ data: jqXHR.responseJSON, jqXHR });

        // reject otherwise
        reject(errorThrown);
      });
  });
};


// function to validate emails
const isEmail = (str) => /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str);

// function to validate username
const isUsername = (str) => /^[\w\d!@#$%^&*\-+[\]{}|\\"':;?/,<.>]*$/.test(str);

// convert to date string 'YYYY-MM-DD at HH:MM'
const toDateString = (date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

// // Modify frontend when order status buttons are clicked.

// const setWaitTime = (waitMinutes, i) => {
//   $(`#accept-${i}`).replaceWith(`<button type="button"id="complete-${i}" class="btn btn-success complete" onclick="completeOrder(${i})">Complete Order</button>`)
//   $(`#reject-${i}`).replaceWith(`<p id=order-timer-${i}>TimeRemaining: ${waitTime}</p>`);


// }

// // $(`#accept-${i}`).replaceWith(`<button type="button"id="complete-${i}" class="btn btn-success complete" onclick="completeOrder(${i})">Complete Order</button>`)
// // $(`#reject-${i}`).replaceWith(`<p id=order-timer-${i}>TimeRemaining: ${waitTime}</p>`);
// // $(`#order-status-${i}`).text("In Progress");

// const completeOrder = (id) => {
//   $(`#complete-${i}`).remove();
//   $(`#order-timer-${i}`).remove();
//   $(`#order-status-${i}`).text("Completed");
// }
