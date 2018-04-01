import * as React from 'react';

const isInitialized = '@children:isInitialized';
const childrenCache = '@children';

/**
 * (cached) getter for `React.Children.toArray(this.props.children)[0]`
 * or `React.Children.toArray(this.props.children).find(findChild)`
 */
export function child<C extends React.Component>(
  findChild?: (child, index: number, children) => boolean
): (target: C, key: string) => void;
export function child<C extends React.Component>(target: C, key: string): void;
export function child<C extends React.Component>() {
  return overloadedDecorator(arguments, findReactChild);
}

function findReactChild(reactChildren: any[], findChild) {
  return findChild ? reactChildren.find(findChild) : reactChildren[0];
}

/**
 * (cached) getter for `React.Children.toArray(this.props.children)`
 * or `React.Children.toArray(this.props.children).filter(filterChildren)`
 */
export function children<C extends React.Component>(
  filterChildren?: (child, index: number, children) => boolean
): (target: C, key: string) => void;
export function children<C extends React.Component>(
  target: C,
  key: string
): void;
export function children<C extends React.Component>() {
  return overloadedDecorator(arguments, filterReactChildren);
}

function filterReactChildren(reactChildren: any[], filterChildren) {
  return filterChildren ? reactChildren.filter(filterChildren) : reactChildren;
}

function overloadedDecorator(
  args,
  mapChildren: (childrend: any[], predicate) => any
) {
  if (typeof args[0] === 'object') {
    return decorate(args[0], args[1], mapChildren);
  }

  const predicate = args[0];
  return (target, key) => {
    decorate(target, key, mapChildren, predicate);
  };
}

function decorate(
  target,
  key: string,
  mapChildren: (childrend: any[], predicate) => any,
  predicate?: (child, index: number, children) => boolean
) {
  if (!target[isInitialized]) {
    target[isInitialized] = true;

    const componentWillReceiveProps = target.componentWillReceiveProps;
    target.componentWillReceiveProps = function(this: React.Component) {
      this[childrenCache] = undefined;
      componentWillReceiveProps &&
        componentWillReceiveProps.apply(this, arguments);
    };
  }

  if (delete target[key]) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get(this: React.Component) {
        if (!this[childrenCache]) {
          this[childrenCache] = {
            ['React.Children']: React.Children.toArray(this.props.children)
          };
        }

        const reactChildren = this[childrenCache]['React.Children'];

        let cached = this[childrenCache][key];
        if (!cached) {
          cached = this[childrenCache][key] = mapChildren(
            reactChildren,
            predicate
          );
        }

        return cached;
      }
    });
  }
}
