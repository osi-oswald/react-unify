# react-unify 💍
Unify state and props, decouple `render()` and update state synchronously (calling `setState()` for you)

## Basic Example

```jsx
import * as React from "react";
import { Render, prop, state } from 'react-unify';

// decoupled stateless render()
@Render(counter => (
  <div>
    <p>Count: {counter.count}</p>
    <button onClick={() => counter.increment()}>
      Increment by {counter.amount}
    </button>
  </div>
))
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

## Installation
```sh
npm install react-unify
```

### Babel
Enable [decorators](https://github.com/osi-oswald/babel-plugin-transform-decorators-ts-compat) and [class property initializer](https://babeljs.io/docs/plugins/transform-class-properties/) with plugins

```sh
npm install --save-dev babel-plugin-transform-decorators-ts-compat babel-plugin-transform-class-properties babel-preset-env babel-preset-react
```

Add plugin to `.babelrc` file
```json
{
  "presets": ["env", "react"],
  "plugins": ["transform-decorators-ts-compat", "transform-class-properties"]
}
```

### TypeScript
Enable [decorators](http://www.typescriptlang.org/docs/handbook/decorators.html) in `tsconfig.json` with compiler option

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### CodeSandbox
Add `react-unify` as dependency, decorators are supported by default :-)

* [JavaScript playground](https://codesandbox.io/s/wnyzll2x1w)
* [TypeScript playground](https://codesandbox.io/s/momx88y1wy)


## API

### @Render

Assigns `this.render` (and `MyComponent.Render`) to a stateless render function 
with the component instance as input.

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

Elevate `this.state.someState` to `this.someState` and access it synchronously.
Will call `this.setState()` for you to update `this.state.someState` and trigger a rerender.
Changes to `this.state.someState` from other sources (manual `this.setState()` / 'getDerivedStateFromProps()' / mutating 'this.state')
will be synchronized back to `this.someState` before `shouldComponentUpdate()` or `forceUpdate()` respectively.

```js
class MyComponent extends React.Component {
  @state myPrimitive = 'myInitialState';
  @state myObject = {name: 'Alice', age: 30};
  @state myArray = [0, 1, 2];

  updateMyPrimitive() {
    this.myPrimitive = 'newValue';
  }

  updateMyObject() {
    // update objects in an immutable way
    this.myObject = {...this.myObject, name: 'Bob'};

    // avoid mutating objects directly 
    // -> will not trigger setState() and therefore not rerender
    this.myObject.name = 'Bob';
  }

  updateMyArray() {
    // update arrays in an immutable way
    // see https://vincent.billey.me/pure-javascript-immutable-array/
    this.myArray = [...this.myArray, 3];

    // avoid mutating arrays directly 
    // -> will not trigger setState() and therefore not rerender
    this.myArray.push(3);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // return new state based on nextProps and prevState
    return { myState: nextProps.myProp };
  }

  // recommended: use React.PureComponent instead
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myState (or nextState.myState) to get next state
    // use this.state.myState to get current state
    return this.myState !== this.state.myState;
  }

  // note: legacy lifecyle
  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }

  componentDidUpdate(prevProps, prevState) {
    // use this.myState (or this.state.myState) to get current state
  }
}

```

### @prop

Elevate `this.props.someProp` to `this.someProp` and 
optionally define its default value whenever `someProp` is `undefined`.

```js
class MyComponent extends React.Component {
  @prop myProp;
  @prop myPropWithDefault = 'myDefaultValue';
  
  // note: legacy lifecyle
  componentWillReceiveProps(nextProps) {
    // use this.myProp (or this.props.myProp) to get current prop
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // return new state based on nextProps and prevState
    return { myState: nextProps.myProp };
  }
  
  // recommended: use React.PureComponent instead
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myProp (or this.props.myProp) to get current prop
    return this.myProp !== nextProps.myProp;
  }
  
  // note: legacy lifecyle
  componentWillUpdate(nextProps, nextState) {
    // use this.myProp (or this.props.myProp) to get current prop
  }
  
  componentDidUpdate(prevProps, prevState) {
    // use this.myProp (or this.props.myProp) to get current prop
  }
}
```

Caveat: When using `@prop` to set a default value, always use `this.myProp`. `this.props.myProp` will not receive the default value set by `@prop` until after the first render. (Set `MyComponent.defaultProps.myProp` directly if this matters for you.)

### @child / @children
Specialized alternative to `@prop children`. Extract and name child(ren) from `this.props.children`, the result will be cached until next `shouldComponentUpdate()` with different `nextProps`.

```js
class MyComponent extends React.Component {
  // gets React.Children.toArray(this.props.children)[0]
  @child myChild;

  // gets React.Children.toArray(this.props.children)
  @children allMyChildren; 
  
  // gets React.Children.toArray(this.props.children).find(findChild)
  @child(findChild) mySpecialChild;

  // gets React.Children.toArray(this.props.children).filter(filterChildren)
  @children(filterChildren) allMySpecialChildren; 
}
```