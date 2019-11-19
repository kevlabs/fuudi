// Function to escape inputs to prevent Cross-Site Scripting

const escape = function (str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

module.exports = {
  escape
}
