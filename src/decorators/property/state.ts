import * as React from 'react';

const elevatedState = '@state';
const useSetState = '@useSetState';

/**
 * Elevate `this.state.someState` to `this.someState` and access it synchronously. 
 * Will call `this.setState()` to update `this.state.someState` and trigger a rerender.
 * Changes to `this.state` from other sources will be synched back on `componentWillUpdate`.
 */
export function state<C extends React.Component>(
  target: C,
  key: string
) {
  if (target[useSetState] == null) {
    target[useSetState] = false;

    const componentWillMount = target.componentWillMount;
    target.componentWillMount = function(this: C) {
      this[useSetState] = true;
      componentWillMount && componentWillMount.apply(this, arguments);
    };

    const componentWillUpdate = target.componentWillUpdate;
    target.componentWillUpdate = function(this: C, nextProps, nextState) {
      this[elevatedState] = nextState;
      componentWillUpdate && componentWillUpdate.apply(this, arguments);
    };
  }

  if (delete target[key]) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        return this[elevatedState] && this[elevatedState][key];
      },

      set(this: C, value) {
        if (!this[elevatedState]) {
          this[elevatedState] = {};
          this.state = this.state || {};
        }

        if (this[useSetState]) {
          this.setState({ [key]: value });
        } else {
          this.state[key] = value;
        }

        if (this[elevatedState] === this.state) {
          this[elevatedState] = { ...this[elevatedState] };
        }

        this[elevatedState][key] = value;
      }
    });
  }
}
