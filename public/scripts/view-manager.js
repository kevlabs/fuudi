// Test file
$(() => {
  const viewManager = new ViewManager($('#app'));
  window.viewManager = viewManager;

  // const app = new ViewComponent(
  //   $(`
  //     <header></header>
  //     <main></main>
  //     <footer></footer>
  //   `)
  // );

  // should not register any other views on the viewManager
  // use viewSets instead
  // can call any views from here though - will be dispatched to all viewSets
  viewManager.addView('app', new App());

  // set up app
  viewManager.view('app');

  // manager header views
  // const header = viewManager.addViewSet($('#app > header'));
  // header.addView('init', new Header());

  // viewManager.view('init', {
  //   userId: 2,
  //   username: 'John Doe'
  // });



  // viewManager.addView('init', loader);
});
