# react-elevate

Elevate state and props as component members to define a unified viewmodel and stateless render function.

## Example

### As single file

```jsx
@Render(vm => (
  <div>
    <p>Count: {vm.count}</p>
    <button onClick={() => vm.increment()}>
      Increment by {vm.amount}
    </button>
  </div>
))
class Counter extends React.Component {
  @prop amount = 1; // get this.props.amount, set its default value
  @state count = 0; // access this.state.count in a synchronous manner

  increment() {
    // calls setState() internally, therefore triggering a rerender
    this.count += this.amount;
    // this.state.count might still be 0 by the async nature of setState()
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

Use `React.PureComponent` instead of `React.Component` for instant performance gains.

### Testing

```jsx
test('CounterRender', () => {
  expect(CounterRender({ count: 0, amount: 1 })).toMatchSnapshot();
  // can also use Counter.Render set by @Render
});

test('Counter', () => {
  const counter = new Counter();
  counter.increment();
  expect(counter).toBe(1);
});
```

## @state

Access `this.state.someState` in a synchronous manner as component member `this.someState`. It will always update `this.state.someState` with `this.setState({someState: ...})` and never mutate it directly. Using `this.setState({someState: ...})` is no longer necessary, but it would update `this.someState` vice versa.

```js
@state myPrimitive = 'myInitialState';
@state myObject = {name: 'Alice', age: 30};
@state myArray = [0, 1, 2];

updateMyPrimitive() {
  this.myPrimitive = 'newValue';
}

updateMyObject() {
  // recommended: update object in an immutable fashion (works well with React.PureComponent)
  this.myObject = {...this.myObject, name: 'Bob'};

  // not recommended: mutate object directly -> will not trigger setState() and therefore not rerender
  this.myObject.name = 'Bob';

  // will trigger setState(), but not rerender on React.PureComponent
  this.myObject = this.myObject;
}

updateMyArray() {
  // recommended: update array in an immutable fashion (works well with React.PureComponent)
  this.myArray = [...this.myArray, 3];

  // not recommended: mutate array directly -> will not trigger setState() and therefore not rerender
  this.myArray.push(3);

  // will trigger setState(), but not rerender on React.PureComponent
  this.myArray = this.myArray;
}

// do not use for React.PureComponent
shouldComponentUpdate(nextProps, nextState) {
  // use this.myState (or nextState.myState) to access next rendered state
  // use this.state.myState to access current rendered state
  return this.myState !== this.state.myState;
}

componentWillUpdate(nextProps, nextState) {
  // same as in shouldComponentUpdate()
}

componentDidUpdate(prevProps, prevState) {
  // use this.myState (or this.state.myState) to access current rendered state
  // use prevState.myState to access previous rendered state
}
```

## @prop

Access `this.props.someProp` as a component member `this.someProp` and initialize its default value if necessary.

```js
@prop myProp;
@prop myPropWithDefault = 'myDefaultValue';

componentWillReceiveProps(nextProps) {
  // use this.myProp (or this.props.myProp) to access current prop
  // use nextProps.myProp to access next prop
}

// do not use for React.PureComponent
shouldComponentUpdate(nextProps, nextState) {
  // use this.myProp (or this.props.myProp) to access current prop
  // use nextProps.myProp to access next prop
  return this.myProp !== nextProps.myProp;
}

componentWillUpdate(nextProps, nextState) {
  // same as in shouldComponentUpdate()
}

componentDidUpdate(prevProps, prevState) {
  // use this.myProp (or this.props.myProp) to access current prop
  // use prevProps.myProp to access previous prop
}
```

When using `@prop` to set a default value, it is recommended to always use `this.myProp` instead of `this.props.myProp`. `this.props.myProp` will not receive the default value until after the first render.

## @Render

Sets `this.render` and `MyComponent.Render` as stateless render function with the component instance as input.

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
@child myOnlyChild; // get React.Children.only(this.props.children)
@children allMyChildren; // get React.Children.toArray(this.props.children)

@child(findChild) mySpecialChild; // get React.Children.toArray(this.props.children).find(findChild)
@children(filterChildren) allMySpecialChildren; // get React.Children.toArray(this.props.children).filter(filterChildren)
```