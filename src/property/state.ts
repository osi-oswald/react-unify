import * as React from 'react';

const elevatedState = '@state';
const useSetState = '@useSetState';

/**
 * Elevate `this.state.someState` to `this.someState` and access it synchronously. 
 * Will call `this.setState()` to update `this.state.someState` and trigger a rerender.
 * Changes to `this.state` from other sources will be synched back on `componentWillUpdate`.
 */
export function state<C extends React.Component>(
  prototype: C,
  stateKey: string
) {
  if (prototype[useSetState] == null) {
    prototype[useSetState] = false;

    const componentWillMount = prototype.componentWillMount;
    prototype.componentWillMount = function(this: C) {
      this[useSetState] = true;
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

        if (this[useSetState]) {
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
