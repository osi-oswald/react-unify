import * as React from 'react';
import { applyNewDescriptor } from './utils';

const isInitialized = '@state:initialized';
const synchronousState = '@state';

/**
 * Elevate `this.state.someState` to `this.someState` and access it synchronously.
 * Will call `this.setState()` for you to update `this.state.someState` and trigger a rerender.
 * Changes to `this.state.someState` from other sources (manual `this.setState()` / `getDerivedStateFromProps()` / mutating `this.state`)
 * will be synchronized back to `this.someState` before `shouldComponentUpdate()` or on `forceUpdate()` respectively.
 */
export function state<C extends React.Component>(
  target: C,
  key: keyof C,
  descriptor?
): void {
  initOnce(target);
  return applyNewDescriptor(target, key, descriptor, descriptorFor(key));
}

function initOnce<C extends React.Component>(target: C) {
  if (!target[isInitialized]) {
    target[isInitialized] = true;

    const sCU = target.shouldComponentUpdate;
    target.shouldComponentUpdate = function(this: C, nextProps, nextState) {
      this[synchronousState] = nextState;
      return sCU ? sCU.apply(this, arguments) : true;
    };

    const fU = target.forceUpdate;
    target.forceUpdate = function(this: C) {
      this[synchronousState] = this.state;
      fU && fU.apply(this, arguments);
    };
  }
}

function descriptorFor<C extends React.Component>(
  key: keyof C
): PropertyDescriptor {
  return {
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
  };
}
