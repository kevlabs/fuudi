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
