import * as React from 'react';

/**
 * Sets `this.render` and `MyComponent.Render` as stateless render function
 * with the component instance as input
 */
export function Render<C extends React.Component>(
  render: (component) => React.ReactNode
) {
  // tslint:disable:only-arrow-functions
  return function(constructor: { Render?; new (...args: any[]): C }) {
    if (arguments[1]) {
      throw new Error('@Render must be used on a React.Component class');
    }

    if (typeof render !== 'function') {
      throw new Error('parameter render must be a function');
    }

    if (constructor.prototype.render) {
      throw new Error('can not set Component.render() when using @Render');
    }

    constructor.Render = render;
    constructor.prototype.render = function() {
      return render(this);
    };
  };
}
