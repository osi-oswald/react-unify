import * as React from 'react';

const isInitialized = '@state:isInitialized';
const useSetState = '@state:useSetState';
const elevatedState = '@state';

/**
 * Elevate `this.state.someState` to `this.someState` and access it synchronously.
 * Will call `this.setState()` for you to update `this.state.someState` and trigger a rerender.
 * Changes to `this.state.someState` from other sources (including manual `this.setState()` calls)
 * will be synchronized back to `this.someState` on `componentWillUpdate()`.
 */
export function state<C extends React.Component>(target: C, key: string) {
  if (!target[isInitialized]) {
    target[isInitialized] = true;

    const componentWillMount = target.componentWillMount;
    target.componentWillMount = function(this: C) {
      // start using setState() from now on
      this[useSetState] = true;
      componentWillMount && componentWillMount.apply(this, arguments);
    };

    const componentWillUpdate = target.componentWillUpdate;
    target.componentWillUpdate = function(this: C, nextProps, nextState) {
      // synchronize back manual changes to this.state
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
