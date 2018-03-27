import * as React from 'react';
import { create } from 'react-test-renderer';
import { prop, Render, state } from '../';

@Render((vm: Counter) => (
  <div>
    <p>Count: {vm.count}</p>
    <button onClick={() => vm.increment()}>Increment by {vm.amount}</button>
  </div>
))
class Counter extends React.PureComponent<{ amount?: number }> {
  static Render: (vm: Partial<Counter>) => any;

  @prop amount: number = 1;
  @state count: number = 0;

  increment() {
    this.count += this.amount;
  }
}

describe('@Render', () => {
  it('renders Counter component', () => {
    const renderer = create(<Counter />);
    renderer.root.findByType(Counter).instance.increment();
    renderer.root.findByType('button').props.onClick();
    expect(renderer).toMatchSnapshot();
  });

  it('sets Counter.Render', () => {
    expect(Counter.Render({ count: 0, amount: 1 })).toMatchSnapshot();
  });
});
