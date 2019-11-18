// Test file

let viewManager;

$(() => {
  viewManager = new ViewManager($('#app'));
  viewManager.addView('init', loader);
});
