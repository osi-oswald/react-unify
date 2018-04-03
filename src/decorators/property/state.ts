import * as React from 'react';

const isInitialized = '@state:isInitialized';
const synchronousState = '@state';

/**
 * Elevate `this.state.someState` to `this.someState` and access it synchronously.
 * Will call `this.setState()` for you to update `this.state.someState` and trigger a rerender.
 * Changes to `this.state.someState` from other sources (including manual `this.setState()` calls)
 * will be synchronized back to `this.someState` on `componentWillUpdate()`.
 */
export function state<C extends React.Component>(target: C, key: string) {
  if (!target[isInitialized]) {
    target[isInitialized] = true;

    const scu = target.shouldComponentUpdate;
    target.shouldComponentUpdate = function(this: C, nextProps, nextState) {
      this[synchronousState] = nextState;
      return scu ? scu.apply(this, arguments) : true;
    };

    const forceUpdate = target.forceUpdate;
    target.forceUpdate = function(this: C) {
      this[synchronousState] = this.state;
      forceUpdate && forceUpdate.apply(this, arguments);
    };
  }

  if (delete target[key]) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        return this[synchronousState] && this[synchronousState][key];
      },

      set(this: C, value) {
        if (!this[synchronousState]) {
          this[synchronousState] = this.state = this.state || {};
        }

        // tslint:disable:no-string-literal
        if (this['updater'].isMounted(this)) {
          this.setState({ [key]: value });

          if (this[synchronousState] === this.state) {
            this[synchronousState] = { ...this.state };
          }
        }

        this[synchronousState][key] = value;
      }
    });
  }
}
