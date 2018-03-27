import * as React from 'react';
import { classOf, Rendered } from '../';

/**
 * Sets `this.render` and `MyComponent.Render` as stateless render function 
 * with the component instance as input / viewmodel.
 */
export function Render(render: (viewModel) => Rendered) {
  return (constructor: classOf<React.Component> & { Render? }) => {
    constructor.Render = render;
    constructor.prototype.render = function() {
      return render(this);
    };
  };
}
