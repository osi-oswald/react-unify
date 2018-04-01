import * as React from 'react';

/**
 * Elevate `this.props.someProp` to `this.someProp` and
 * optionally define its default value whenever `someProp` is `undefined`.
 */
export function prop<C extends React.Component>(target: C, key: string) {
  if (delete target[key]) {
    const constructor = target.constructor as Function & { defaultProps };

    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        const propVal = this.props[key];
        const defaultProps = constructor.defaultProps;

        return propVal === undefined
          ? defaultProps && defaultProps[key]
          : propVal;
      },

      set(value) {
        let defaultProps = constructor.defaultProps;

        if (!defaultProps) {
          defaultProps = constructor.defaultProps = {};
        }

        defaultProps[key] = value;
      }
    });
  }
}
