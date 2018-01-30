import * as React from 'react';

const synchedState = '@state';
const syncState = '@setState';

/**
 * Allows to use this.myState instead of this.state.myState and can read/write to it synchronously (rerenders asynchronously).
 *
 * Examples:
 * @state myPrimitiveState: string = 'myInitialState'
 * @state myComplexState: Person = {name: 'Alice', age: 30}
 * myPrimitiveUpdate() { this.myPrimitiveState = 'newValue'; }
 * myComplexUpdate() { this.myComplexState = {...this.myComplexState, name: 'Bob'} }
 *
 * Optionally use with:
 * - PureComponent
 * - shouldComponentUpdate(nextProps) { return this.myPrimitiveState !== this.state.myPrimitiveState || this.myComplexState !== this.state.myComplexState }
 * - shouldComponentUpdate(nextProps, nextState) { return nextState.myPrimitiveState !== this.state.myPrimitiveState || nextState.myComplexState !== this.state.myComplexState }
 *
 * Note:
 *  - this.myState is updated synchronously
 *  - this.state.myState is updated asynchronously
 */
export function state<C extends React.Component>(
  prototype: C,
  stateKey: string
) {
  if (!prototype[syncState]) {
    augmentSetState(prototype);

    prototype[syncState] = syncStateBeforeWillMount;
    const componentWillMount = prototype.componentWillMount;

    prototype.componentWillMount = function(this: C) {
      this[syncState] = syncStateAfterWillMount;
      componentWillMount && componentWillMount();
    };
  }

  if (delete prototype[stateKey]) {
    Object.defineProperty(prototype, stateKey, {
      configurable: true,
      enumerable: true,
      get(this: C) {
        return this[synchedState] && this[synchedState][stateKey];
      },
      set(this: C, value) {
        this[syncState](stateKey, value);
      }
    });
  }
}

function augmentSetState<C extends React.Component>(prototype: C) {
  const setState = prototype.setState;
  prototype.setState = function(this: C, update, callback) {
    ensureState(this);

    if (typeof update === 'object') {
      Object.assign(this[synchedState], update);
    } else if (typeof update === 'function') {
      const updateFn = update;
      update = (prevState, props) => {
        const partialState = updateFn(prevState, props);
        Object.assign(this[synchedState], partialState);
        return partialState;
      };
    }

    if (callback) {
      setState.call(this, update, callback);
    } else {
      setState.call(this, update);
    }
  };
}

function ensureState<C extends React.Component>(component: C) {
  if (!component[synchedState]) {
    component[synchedState] = {};
    component.state = component.state || {};
  }
}

function syncStateBeforeWillMount<C extends React.Component>(
  this: C,
  key: string,
  value
) {
  ensureState(this);
  this[synchedState][key] = value;
  this.state[key] = value;
}

function syncStateAfterWillMount<C extends React.Component>(
  this: C,
  key: string,
  value
) {
  this.setState({ [key]: value });
}
