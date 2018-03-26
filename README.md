# react-elevate

Elevate state and props to form a unified viewmodel for a stateless component render function. Update/Read the elevated state synchronously (no need to call `this.setState()` manually).

## Example

```jsx
// --- Counter.jsx ---

@Render(vm => (
  <div>
    <p>Count: {vm.count}</p>
    <button onClick={() => vm.increment()}>
      Increment by {vm.amount}
    </button>
  </div>
))
export class Counter extends React.Component {
  @prop amount = 1; // getter for this.props.amount, setter for Counter.defaultProps.amount
  @state count = 0; // access this.state.count in a synchronous manner

  increment() {
    this.count += this.amount;
    // this.count is updated synchronously
    // calls setState() internally, therefore triggering a rerender
    // this.state.count might still be unchanged by the async nature of setState()
  }
}
```

### As separate files

```jsx
// --- CounterRender.jsx ---

export const CounterRender = vm =>
  <div>
    <p>Count: {vm.count}</p>
    <button onClick={() => vm.increment()}>
      Increment by {vm.amount}
    </button>
  </div>
```

```jsx
// --- Counter.js ---
import { CounterRender } from './CounterRender';

@Render(CounterRender)
class Counter extends React.Component {
  @prop amount = 1;
  @state count = 0;

  increment() {
    this.count += this.amount;
  }
}
```

### Hint
Use `React.PureComponent` instead of `React.Component` for instant performance gains.

### Testing

```jsx
test('CounterRender', () => {
  expect(CounterRender({ count: 0, amount: 1 })).toMatchSnapshot();
  // can also use Counter.Render set by @Render
});

test('Counter with default props', () => {
  const counter = new Counter({});
  counter.increment();
  expect(counter.count).toBe(1);
});
```

## @state

Elevate `this.state.someState` to `this.someState` and access it synchronously. It will update `this.state.someState` with `this.setState({someState: ...})` and never mutate it directly. // TODO Using `this.setState({someState: ...})` is no longer necessary, but it will update `this.someState` vice versa.

```js
class MyComponent extends React.Component {
  @state myPrimitive = 'myInitialState';
  @state myObject = {name: 'Alice', age: 30};
  @state myArray = [0, 1, 2];

  updateMyPrimitive() {
    this.myPrimitive = 'newValue';
  }

  updateMyObject() {
    // recommended: update object in an immutable manner (necessary for React.PureComponent)
    this.myObject = {...this.myObject, name: 'Bob'};

    // not recommended: mutate object directly -> will not trigger setState() and therefore not rerender
    this.myObject.name = 'Bob';

    // will trigger setState(), but not rerender on React.PureComponent
    this.myObject = this.myObject;
  }

  updateMyArray() {
    // recommended: update array in an immutable manner (necessary for React.PureComponent)
    this.myArray = [...this.myArray, 3];

    // not recommended: mutate array directly -> will not trigger setState() and therefore not rerender
    this.myArray.push(3);

    // will trigger setState(), but not rerender on React.PureComponent
    this.myArray = this.myArray;
  }

  // careful when using React.PureComponent
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myState to access next rendered state (or nextState.myState)
    // use this.state.myState to access current rendered state
    return this.myState !== this.state.myState;
  }

  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }

  componentDidUpdate(prevProps, prevState) {
    // use this.myState to access current rendered state (or this.state.myState)
  }
}
```

## @prop

Elevate `this.props.someProp` to `this.someProp` and set its default value if necessary.

```js
class MyComponent extends React.Component {
  @prop myProp;
  @prop myPropWithDefault = 'myDefaultValue';
  
  componentWillReceiveProps(nextProps) {
    // use this.myProp to access current prop (or this.props.myProp)
  }
  
  // careful when using React.PureComponent
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myProp to access current prop (or this.props.myProp)
    return this.myProp !== nextProps.myProp;
  }
  
  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }
  
  componentDidUpdate(prevProps, prevState) {
    // use this.myProp to access current prop (or this.props.myProp)
  }
}
```

Note: When using `@prop` to set a default value, it is recommended to always use `this.myProp`. `this.props.myProp` will not receive the default value set by `@prop` until after the first render. Use `MyComponent.defaultProps.myProp` to set default values if this matters.

## @Render

Sets `this.render` and `MyComponent.Render` as stateless render function with the component instance as viewmodel/input.

```js
@Render(MyComponentRender)
class MyComponent extends React.Component {
  /* ... */

  // set by @Render
  render() {
    return MyComponentRender(this);
  }

  // set by @Render
  static Render = MyComponentRender;
}
```

## @child / @children
```js
class MyComponent extends React.Component {
  @child myOnlyChild; // getter for React.Children.only(this.props.children)
  @children allMyChildren; // getter for React.Children.toArray(this.props.children)
  
  @child(findChild) mySpecialChild; // getter for React.Children.toArray(this.props.children).find(findChild)
  @children(filterChildren) allMySpecialChildren; // getter for React.Children.toArray(this.props.children).filter(filterChildren)
}
```