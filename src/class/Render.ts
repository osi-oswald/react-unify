import * as React from 'react';
import { classOf, Rendered } from '../';

/**
 * Separate a Component into View (stateless render) and ViewModel (Component instance).
 *
 * Example:
 * @Render((vm: Counter) =>
 *  <div>
 *    <p>Count: {vm.count}</p>
 *    <button onClick={() => vm.increment()}>
 *      Increment by {vm.amount}
 *    </button>
 *  </div>
 * )
 * class Counter extends React.Component<{ amount?: number }> {
 *   @prop amount: number = 1;
 *   @state count: number = 0;
 *   increment() { this.count += this.amount; }
 * }
 *
 * Optionally use:
 * - React.PureComponent
 * - MyComponent.Render({...}) to test the view independently
 * - new MyComponent({...}) to test the view model independently
 */
export function Render(render: (viewModel) => Rendered) {
  return (constructor: classOf<React.Component> & { Render? }) => {
    constructor.Render = render;
    constructor.prototype.render = function() {
      return render(this);
    };
  };
}
