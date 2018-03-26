// tslint:disable:no-string-literal
import * as React from 'react';

/**
 * Allows to use this.myProp instead of this.props.myProp and initialize its default value once.
 *
 * Example:
 * @prop myProp: string = 'myDefaultValueIfUndefined';
 *
 * Optionally use with:
 * - PureComponent
 * - shouldComponentUpdate(nextProps) { return this.myProp !== nextProps.myProp }
 *
 * Note:
 * - this.myProp and this.props.myProp are readonly
 * - this.myProp will always return the default value if this.myProp is undefined
 * - this.props.myProp will not return the default value in the first render (unless React's defaultProps is used)
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
