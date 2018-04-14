import * as React from 'react';
import { applyNewDescriptor } from './utils';

/**
 * Elevate `this.props.someProp` to `this.someProp` and
 * optionally define its default value whenever `someProp` is `undefined`.
 */
export function prop<C extends React.Component>(
  target: C,
  key: keyof C,
  descriptor?
) {
  return applyNewDescriptor(
    target,
    key,
    descriptor,
    descriptorFor(key, target.constructor as any)
  );
}

function descriptorFor<C extends React.Component>(
  key,
  constructor: Function & { defaultProps }
): PropertyDescriptor {
  return {
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
  };
}
