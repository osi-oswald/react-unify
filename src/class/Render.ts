import * as React from 'react';
import { classOf, prop, Rendered, state } from '../';

/**
 * Separate a Component into View (stateless render) and ViewModel (Component class without render).
 * @see prop @prop decorator
 * @see state @state decorator
 *
 * Example:
 * @Render((vm: Counter) =>
 *  <div>
 *    <p>Count: {vm.count}</p>
 *    <button onClick={() => vm.increment()}>Increment by {vm.amount}</button>
 *  </div>
 * )
 * class Counter extends React.Component<{ amount?: number }> {
 *   @prop amount: number = 1;
 *   @state count: number = 0;
 *   increment() { this.count += this.amount; }
 * }
 *
 * Optional use:
 * - PureComponent
 * - MyComponent.Render({...}) for testing of the view itself
 * - new MyComponent(...) for testing of the view model itself
 */
export function Render(render: (viewModel) => Rendered) {
  // tslint:disable-next-line:only-arrow-functions
  return function(constructor: classOf<React.Component> & { Render? }) {
    constructor.Render = render;
    constructor.prototype.render = function() {
      return render(this);
    };
  };
}
