import * as React from 'react';

/**
 * Elevate `this.props.someProp` to `this.someProp` and set its default value if necessary.
 */
export function prop<C extends React.Component>(prototype: C, key: string) {
  if (delete prototype[key]) {
    const constructor = prototype.constructor as Function & { defaultProps };

    Object.defineProperty(prototype, key, {
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
