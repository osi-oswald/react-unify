import * as React from 'react';
import { create } from 'react-test-renderer';
import { prop, Render, state } from '../';

@Render((counter: Counter) => (
  <div>
    <p>Count: {counter.count}</p>
    <button onClick={() => counter.increment()}>
      Increment by {counter.amount}
    </button>
  </div>
))
class Counter extends React.Component<{ amount?: number }> {
  static Render: (counter: Partial<Counter>) => any;

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
