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
  addView(name, component) {
    component instanceof ViewComponent && (this._views[name] = component);
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
    return this._viewSets.find(viewSet => viewSet._$element = $element);
  }

  removeViewSet(viewSet) {
    const index = this._viewSets.indexOf(viewSet);
    (index !== -1) && this._viewSets.splice(index, 1);
    return this;
  }

  // switch to view if it exists
  // detach current component and call mount method on new component (should call render (which should return a $ element), mount the $ returned from that fn, then call componentDidMount). component should be able to opt out from rerendering if $ already exists ($element property on class instance)
  // should trickle down to all viewsets
  view(name) {
    const component = this._views[name];
    component && (this._inView && this._inView.$element.detach() || true) && component.mount(this._$element);
    this._viewSets.forEach(viewSet => viewSet.view(name));
    return this;
  }
}

class ViewComponent {
  // $element is an optional parameter
  constructor($element, reRender = true) {
    // reRender should be set locally
    this.reRender = reRender;
    this._$element = $element;
  }

  get $element() {
    return this._$element;
  }

  mount($container) {
    this._$element = this.shouldRender && this.render() || this.$element;
    this.$element && $container.append(this.$element) && this.componentDidMount(this.$element);
    return this;
  }

  get shouldRender() {
    return !this._$element || this.reRender;
  }

  render() {
    // should be implemented locally
    return;
  }

  componentDidMount() {
    // should be implemented locally
    // not invoked if render returns a falsy value
    return;
  }
}
