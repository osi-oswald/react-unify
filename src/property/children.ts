import * as React from 'react';

/**
 * getter for getter for `React.Children.toArray(this.props.children)[0]` or
 * getter for `React.Children.toArray(this.props.children).find(findChild)`
 */
export function child<C extends React.Component>(
  findChild: (child, index: number, children) => boolean
): (target: C, key: string) => void;
export function child<C extends React.Component>(target: C, key: string): void;
export function child<C extends React.Component>() {
  return decoratorFor(arguments, 'find');
}

/**
 * getter for `React.Children.toArray(this.props.children)`
 * getter for `React.Children.toArray(this.props.children).filter(filterChildren)`
 */
export function children<C extends React.Component>(
  filterChildren: (child, index: number, children) => boolean
): (target: C, key: string) => void;
export function children<C extends React.Component>(
  target: C,
  key: string
): void;
export function children<C extends React.Component>() {
  return decoratorFor(arguments, 'filter');
}

function decoratorFor(args, arrayFnKey: 'find' | 'filter') {
  if (typeof args[0] === 'function') {
    const findChild = args[0];

    return (target, key: string) => {
      decorate(target, key, arrayFnKey, findChild);
    };
  } else {
    decorate(args[0], args[1], arrayFnKey);
  }
}

function decorate(
  target,
  key: string,
  arrayFnKey: 'find' | 'filter',
  predicate?: (child, index: number, children) => boolean
) {
  if (delete target[key]) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: getterFor(arrayFnKey, predicate)
    });
  }
}

function getterFor<C extends React.Component>(
  arrayFnKey: string,
  predicate?: (child, index: number, children) => boolean
) {
  if (predicate) {
    return function(this: C) {
      return React.Children.toArray(this.props.children)[arrayFnKey](predicate);
    };
  }

  switch (arrayFnKey) {
    case 'find':
      return function(this: C) {
        return React.Children.toArray(this.props.children)[0];
      };
    case 'filter':
      return function(this: C) {
        return React.Children.toArray(this.props.children);
      };
  }
}
