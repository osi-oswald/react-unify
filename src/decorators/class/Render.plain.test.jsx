import * as React from 'react';
import { create } from 'react-test-renderer';
import { child, children, prop, Render, state } from '../';

class Counter extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    const count = nextProps.deriveCount;
    return count == null ? null : { count };
  }

  newCount;
  amount;
  count;
  myChild;
  myChildren;

  constructor(props) {
    super(props);
    this.amount = 1;
    this.count = 0;
  }

  increment() {
    this.count += this.amount;
  }

  incrementSetState() {
    // @ts-ignore
    this.setState({ count: this.state.count + this.amount });
  }

  incrementForceUpdate() {
    // @ts-ignore
    this.state.count += this.amount;
    this.forceUpdate();
  }
}

Render(counter => (
  <div>
    <p>Count: {counter.count}</p>
    <button onClick={() => counter.increment()}>
      Increment by {counter.amount}
    </button>
  </div>
))(Counter);
prop(Counter.prototype, 'newCount');
prop(Counter.prototype, 'amount');
state(Counter.prototype, 'count');
child(Counter.prototype, 'myChild');
children(Counter.prototype, 'myChildren');

describe('@Render', () => {
  it('updates from @state', () => {
    const renderer = create(<Counter />);
    renderer.root.findByType(Counter).instance.increment();
    expect(renderer).toMatchSnapshot();
  });

  it('updates from setState()', () => {
    const renderer = create(<Counter />);
    renderer.root.findByType(Counter).instance.incrementSetState();
    expect(renderer).toMatchSnapshot();
  });

  it('updates from forceUpdate()', () => {
    const renderer = create(<Counter />);
    renderer.root.findByType(Counter).instance.incrementForceUpdate();
    expect(renderer).toMatchSnapshot();
  });

  it('updates from getDerivedStateFromProps()', () => {
    const renderer = create(<Counter />);
    renderer.update(<Counter deriveCount={1} />);
    expect(renderer).toMatchSnapshot();
  });

  it('has myChild', () => {
    const renderer = create(<Counter>my child</Counter>);
    const counter = renderer.getInstance();
    expect(counter.myChild).toEqual('my child');
  });

  it('has myChildren', () => {
    const renderer = create(
      <Counter>
        <i>child 1</i>
        <i>child 2</i>
      </Counter>
    );
    const counter = renderer.getInstance();
    expect(counter.myChildren).toMatchSnapshot();
  });

  it('parameter render must be a function', () => {
    class MyComponent extends React.Component {}

    expect(() => Render(null)(MyComponent)).toThrow(
      'parameter render must be a function'
    );
  });

  it('can not set Component.render() when using @Render', () => {
    class MyComponent extends React.Component {
      render() {
        return null;
      }
    }

    expect(() => Render(() => null)(MyComponent)).toThrow(
      'can not set Component.render() when using @Render'
    );
  });

  it('sets Counter.Render', () => {
    expect(Counter.Render({ count: 0, amount: 1 })).toMatchSnapshot();
  });
});
