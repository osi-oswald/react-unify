// tslint:disable:no-string-literal
import * as React from 'react';

/**
 * Elevate `this.props.someProp` to `this.someProp` and set its default value if necessary.
 */
export function prop<C extends React.Component>(prototype: C, propKey: string) {
  if (delete prototype[propKey]) {
    const constructor = prototype.constructor as Function & { defaultProps };

    Object.defineProperty(prototype, propKey, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        const propVal = this.props[propKey];
        const defaultProps = constructor.defaultProps;

        return propVal === undefined
          ? defaultProps && defaultProps[propKey]
          : propVal;
      },

      set(value) {
        let defaultProps = constructor.defaultProps;

        if (!defaultProps) {
          defaultProps = constructor.defaultProps = {};
        }

        defaultProps[propKey] = value;
      }
    });
  }
}
