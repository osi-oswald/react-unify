import * as React from 'react';

/**
 * getter for React.Children.only(this.props.children) or
 * getter for React.Children.toArray(this.props.children).find(findChild)
 */
export function child<C extends React.Component>(prototype: C, key: string) {
  if (delete prototype[key]) {
    Object.defineProperty(prototype, key, {
      configurable: true,
      enumerable: true,

      get(this: C) {
        return React.Children.toArray(this.props.children)[0] || null;
      },
    });
  }
}
