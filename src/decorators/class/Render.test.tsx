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
class Counter extends React.Component<{
  amount?: number;
  newCount?: number;
}> {
  static Render: (counter: Partial<Counter>) => any;

  static getDerivedStateFromProps(nextProps) {
    const newCount = nextProps.newCount;
    return newCount == null ? null : { count: newCount };
  }

  @prop amount: number = 1;
  @prop newCount!: number;
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

  it('updates from getDerivedStateFromProps', () => {
    const renderer = create(<Counter />);
    renderer.update(<Counter newCount={1} />);
    expect(renderer).toMatchSnapshot();
  });

  it('parameter render must be a function', () => {
    class MyComponent extends React.Component {}

    expect(() => Render(null as any)(MyComponent)).toThrow();
  });

  it('can not set Component.render() when using @Render', () => {
    class MyComponent extends React.Component {
      render() {
        return null;
      }
    }

    expect(() => Render(() => null)(MyComponent)).toThrow();
  });

  it('sets Counter.Render', () => {
    expect(Counter.Render({ count: 0, amount: 1 })).toMatchSnapshot();
  });
});
