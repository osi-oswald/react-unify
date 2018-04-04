import * as React from 'react';

/**
 * Sets `this.render` and `MyComponent.Render` as stateless render function
 * with the component instance as input
 */
export function Render<C extends React.Component>(
  render: (component) => React.ReactNode
) {
  return (constructor: { Render?; new (...args: any[]): C }) => {
    constructor.Render = render;
    constructor.prototype.render = function() {
      return render(this);
    };
  };
}
