import * as React from 'react';
import { applyNewDescriptor } from './utils';

const isInitialized = '@children:isInitialized';
const lastProps = '@children:lastProps';
const childrenCache = '@children';

/**
 * (cached) getter for React.Children.toArray(this.props.children)[0]
 * or React.Children.toArray(this.props.children).find(findChild)
 */
export function child<C extends React.Component>(
  findChild?: (child, index: number, children) => boolean
): (target: C, key: keyof C) => void;
export function child<C extends React.Component>(target: C, key: keyof C): void;
export function child<C extends React.Component>() {
  return overloadedDecorator(arguments, findChild);
}

function findChild(reactChildren: any[], predicate) {
  return predicate ? reactChildren.find(predicate) : reactChildren[0];
}

/**
 * (cached) getter for React.Children.toArray(this.props.children)
 * or React.Children.toArray(this.props.children).filter(filterChildren)
 */
export function children<C extends React.Component>(
  filterChildren?: (child, index: number, children) => boolean
): (target: C, key: keyof C) => void;
export function children<C extends React.Component>(
  target: C,
  key: keyof C
): void;
export function children<C extends React.Component>() {
  return overloadedDecorator(arguments, filterChildren);
}

function filterChildren(reactChildren: any[], predicate) {
  return predicate ? reactChildren.filter(predicate) : reactChildren;
}

function overloadedDecorator(
  args,
  mapChildren: (children: any[], predicate) => any
) {
  if (typeof args[0] === 'object') {
    return decorate(args[0], args[1], args[2], mapChildren);
  }

  const predicate = args[0];
  if (predicate != null && typeof predicate !== 'function') {
    throw new Error(`parameter ${mapChildren.name} must be a function`);
  }

  return (target, key, descriptor) => {
    decorate(target, key, descriptor, mapChildren, predicate);
  };
}

function decorate<C extends React.Component>(
  target: C,
  key: keyof C,
  descriptor: PropertyDescriptor & { initializer? },
  mapChildren: (children: any[], predicate) => any,
  predicate?: (child, index: number, children) => boolean
) {
  initOnce(target);
  return applyNewDescriptor(
    target,
    key,
    descriptor,
    descriptorFor(key, mapChildren, predicate)
  );
}

function initOnce<C extends React.Component>(target: C) {
  if (!target[isInitialized]) {
    target[isInitialized] = true;

    const cWRP = target.componentWillReceiveProps;
    const UcWRP = target.UNSAFE_componentWillReceiveProps;

    if (cWRP) {
      target.componentWillReceiveProps = function(this: React.Component) {
        this[childrenCache] = undefined;
        cWRP && cWRP.apply(this, arguments);
      };
    } else if (UcWRP) {
      target.UNSAFE_componentWillReceiveProps = function(
        this: React.Component
      ) {
        this[childrenCache] = undefined;
        UcWRP && UcWRP.apply(this, arguments);
      };
    } else {
      const sCU = target.shouldComponentUpdate;
      target.shouldComponentUpdate = function(this, nextProps, nextState) {
        if (this[lastProps] !== nextProps) {
          this[childrenCache] = undefined;
          this[lastProps] = nextProps;
        }

        return sCU ? sCU.apply(this, arguments) : true;
      };
    }
  }
}

function descriptorFor(key, mapChildren, predicate) {
  return {
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
  };
}
