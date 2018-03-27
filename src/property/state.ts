import * as React from 'react';

const elevatedState = '@state';
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
    setupSyncState(prototype);
  }

  if (delete prototype[stateKey]) {
    prototype[elevatedState][stateKey] = undefined;

    Object.defineProperty(prototype, stateKey, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        return this[elevatedState][stateKey];
      },

      set(this: C, value) {
        if (this[elevatedState] === prototype[elevatedState]) {
          this[elevatedState] = {};
          this.state = this.state || {};
        }

        this[elevatedState][stateKey] = value;
        this[syncState](stateKey, value);
      }
    });
  }
}

function setupSyncState<C extends React.Component>(prototype: C) {
  prototype[elevatedState] = {};
  prototype[syncState] = syncStateBeforeWillMount;

  const componentWillMount = prototype.componentWillMount;
  prototype.componentWillMount = function(this: C) {
    this[syncState] = syncStateAfterWillMount;
    componentWillMount && componentWillMount.apply(this, arguments);
  };

  if (
    !process.env.NODE_ENV ||
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    checkStateOutOfSync(prototype);
  }
}

function checkStateOutOfSync<C extends React.Component>(prototype: C) {
  const componentWillUpdate = prototype.componentWillUpdate;
  prototype.componentWillUpdate = function(this: C, nextProps, nextState) {
    for (const prop in this[elevatedState]) {
      if (this[elevatedState][prop] !== nextState[prop]) {
        console.error(
          `elevated state '${prop}' was out of sync, always use 'this.${prop} = newValue' to update`
        );

        this[elevatedState][prop] = nextState[prop];
      }
    }

    componentWillUpdate && componentWillUpdate.apply(this, arguments);
  };
}

function syncStateBeforeWillMount<C extends React.Component>(
  this: C,
  key: string,
  value
) {
  this.state[key] = value;
}

function syncStateAfterWillMount<C extends React.Component>(
  this: C,
  key: string,
  value
) {
  this.setState({ [key]: value });
}
