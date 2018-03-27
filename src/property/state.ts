import * as React from 'react';

const elevatedState = '@state';
const canSetState = '@canSetState';

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
  if (prototype[canSetState] == null) {
    prototype[canSetState] = false;

    const componentWillMount = prototype.componentWillMount;
    prototype.componentWillMount = function(this: C) {
      this[canSetState] = true;
      componentWillMount && componentWillMount.apply(this, arguments);
    };

    const componentWillUpdate = prototype.componentWillUpdate;
    prototype.componentWillUpdate = function(this: C, nextProps, nextState) {
      this[elevatedState] = nextState;
      componentWillUpdate && componentWillUpdate.apply(this, arguments);
    };
  }

  if (delete prototype[stateKey]) {
    Object.defineProperty(prototype, stateKey, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        return this[elevatedState] && this[elevatedState][stateKey];
      },

      set(this: C, value) {
        if (!this[elevatedState]) {
          this[elevatedState] = {};
          this.state = this.state || {};
        }

        if (this[canSetState]) {
          this.setState({ [stateKey]: value });
        } else {
          this.state[stateKey] = value;
        }

        if (this[elevatedState] === this.state) {
          this[elevatedState] = { ...this[elevatedState] };
        }

        this[elevatedState][stateKey] = value;
      }
    });
  }
}
