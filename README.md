# react-unify 💍
* Unify state and props inside the component
* Make component render stateless and testable
* Get/set state synchronously (calls `setState()` for you)

## Installation
```sh
npm install react-unify
```

## Basic Example

```jsx
// stateless component render
@Render(counter => 
  <div>
    <p>Count: {counter.count}</p>
    <button onClick={() => counter.increment()}>
      Increment by {counter.amount}
    </button>
  </div>
)
export class Counter extends React.Component {
  @prop amount = 1; // gets this.props.amount, sets defaultProps.amount
  @state count = 0; // access this.state.count in a synchronous way

  increment() {
    this.count += this.amount;
    // this.count is updated synchronously
    // calls setState() for you, triggering a rerender
    // this.state.count gets updated asynchronously
  }
}
```

### As separate files

```jsx
// --- CounterRender.jsx ---
export const CounterRender = counter =>
  <div>
    <p>Count: {counter.count}</p>
    <button onClick={() => counter.increment()}>
      Increment by {counter.amount}
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

Tip: Use `React.PureComponent` instead of `React.Component` for instant performance gains.

### Testing

```jsx
test('Counter render', () => {
  expect(CounterRender({ count: 0, amount: 1 })).toMatchSnapshot();
  // or use Counter.Render set by @Render
});

test('Counter instance', () => {
  const counter = new Counter({});
  counter.increment();
  expect(counter.count).toBe(1);
});
```

## API

### @Render

Assigns `this.render` (and `MyComponent.Render`) to a stateless render function with the component instance as input.

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

### @state

Elevate `this.state.someState` to `this.someState` and access it synchronously. Will call `this.setState()` for you to update `this.state.someState` and trigger a rerender. Changes to `this.state.someState` from other sources (including manual `this.setState()` calls) will be synchronized back to `this.someState` on `componentWillUpdate()`.

```js
class MyComponent extends React.Component {
  @state myPrimitive = 'myInitialState';
  @state myObject = {name: 'Alice', age: 30};
  @state myArray = [0, 1, 2];

  updateMyPrimitive() {
    this.myPrimitive = 'newValue';
  }

  updateMyObject() {
    // update the object in an immutable manner
    this.myObject = {...this.myObject, name: 'Bob'};

    // avoid mutating the object directly 
    // -> will not trigger setState() and therefore not rerender
    this.myObject.name = 'Bob';
  }

  updateMyArray() {
    // update the array in an immutable manner:
    // https://vincent.billey.me/pure-javascript-immutable-array/
    this.myArray = [...this.myArray, 3];

    // avoid mutating the array directly 
    // -> will not trigger setState() and therefore not rerender
    this.myArray.push(3);
  }

  // note: use React.PureComponent instead
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myState (or nextState.myState) to access next state
    // use this.state.myState to access current state
    return this.myState !== this.state.myState;
  }

  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }

  componentDidUpdate(prevProps, prevState) {
    // use this.myState to access current rendered state
  }
}

```

### @prop

Elevate `this.props.someProp` to `this.someProp` and optionally define its default value whenever `someProp` is `undefined`.

```js
class MyComponent extends React.Component {
  @prop myProp;
  @prop myPropWithDefault = 'myDefaultValue';
  
  componentWillReceiveProps(nextProps) {
    // use this.myProp to access current prop
  }
  
  // note: use React.PureComponent instead
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myProp to access current prop
    return this.myProp !== nextProps.myProp;
  }
  
  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }
  
  componentDidUpdate(prevProps, prevState) {
    // use this.myProp to access current prop
  }
}
```

Caveat: When using `@prop` to set a default value, always use `this.myProp`, `this.props.myProp` will not receive the default value set by `@prop` until after the first render. (Use `MyComponent.defaultProps.myProp` directly if this matters for you.)

### @child / @children
Specialized alternative to `@prop children`. Rename/Extract child(ren) from `this.props.children`, the result will be cached until next `componentWillReceiveProps()`.

```js
class MyComponent extends React.Component {
  // gets `React.Children.toArray(this.props.children)[0]`
  @child myChild;

  // gets `React.Children.toArray(this.props.children)`
  @children allMyChildren; 
  
  // gets `React.Children.toArray(this.props.children).find(findChild)`
  @child(findChild) mySpecialChild;

  // gets `React.Children.toArray(this.props.children).filter(filterChildren)`
  @children(filterChildren) allMySpecialChildren; 
}
```