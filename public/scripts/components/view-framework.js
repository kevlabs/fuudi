/* All $element jQuery objects should be a collection of just one jQuery DOM element or we might run into issues trying to append the same container to multiple containers.
Use selectors specific enough so that just one DOM object is returned.
*/

class ViewManager {
  constructor($element) {
    this._$element = $element;
    this._views = {};
    this._viewSets = [];
    this._inView = null;
  }

  // add/update view
  // if 'alwaysDetach' flag set to true, component will be detached when another view is called event if no component is registered for that view. Default: false - Component will be detached only if it can be replaced by another component when view called
  addView(name, component, alwaysDetach = false) {
    component instanceof ViewComponent && (this._views[name] = { component, alwaysDetach });
    return this;
  }

  getView(name) {
    return this._views[name];
  }

  removeView(name) {
    delete this._views[name];
    return this;
  }

  // viewsets are instances of the ViewManager class
  addViewSet($element) {
    const existing = this.getViewSet($element);
    if (existing) return existing;

    const viewSet = new ViewManager($element);
    this._viewSets.push(viewSet);
    return viewSet;
  }

  getViewSet($element) {
    return this._viewSets.find(viewSet => viewSet._$element.is($element));
  }

  removeViewSet(viewSet) {
    const index = this._viewSets.indexOf(viewSet);
    (index !== -1) && this._viewSets.splice(index, 1);
    return this;
  }

  // switch to view if it exists
  // detach current component and call mount method on new component (should call render (which should return a $ element), mount the $ returned from that fn, then call componentDidMount). component should be able to opt out from rerendering if $ already exists ($element property on class instance)
  // should trickle down to all viewsets
  // might want to set props default to '{}'
  view(name, props = {}) {
    // fetch component to display
    const viewHandler = this._views[name];

    // detach component if view has changed
    this._inView && (viewHandler && this._inView.component !== viewHandler.component || this._inView.alwaysDetach) && this._inView.$element.detach() && (this._inView = null);

    // set this._inView
    !this._inView && viewHandler && (this._inView = viewHandler);

    // mount component
    // append viewManager to props
    viewHandler && viewHandler.component.mount(this._$element, { ...props, viewManager: this });

    // trickle view down
    // components managed by viewSets may not be children of component in view
    // pass props to viewSets
    this._viewSets.forEach(viewSet => viewSet.view(name, { ...props, viewManager: this }));

    return this;
  }
}

class ViewComponent {
  // $element is an optional parameter
  constructor($element = null, reRender = true) {
    // don't rerender if instance of ViewComponent - this are meant to be simple one time render components
    // extend ViewComponent if need to rerender
    this.reRender = Object.getPrototypeOf(this) !== ViewComponent && reRender;
    this._$element = $element;
  }

  get $element() {
    return this._$element;
  }

  mount($container, props) {
    // if render/rerender, detach $element and call render
    if (this.shouldRender) {
      this.$element && this.$element.detach();
      this._$element = this.render(props) || this.$element;
      this.$element && $container.append(this.$element) && this.componentDidMount();
    }
    return this;
  }

  get shouldRender() {
    return !this._$element || this.reRender;
  }

  render(props = {}) {
    // should be implemented locally
    return;
  }

  componentDidMount() {
    // should be implemented locally
    // not invoked if render returns a falsy value
    return;
  }
}
