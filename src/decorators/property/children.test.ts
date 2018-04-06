import * as React from 'react';
import { children as childrenDecorator } from './children';

class TestComponent extends React.Component<{ children? }> {
  myChildren;
}

describe('@children', () => {
  let Component: typeof TestComponent;

  beforeEach(() => {
    Component = class extends TestComponent {};
  });

  describe('all children', () => {
    beforeEach(() => {
      childrenDecorator(Component.prototype, 'myChildren');
    });

    it('gets children', () => {
      const component = new Component({ children: 'myChild' });
      expect(component.myChildren).toEqual(['myChild']);
    });

    it('gets children from array', () => {
      const component = new Component({ children: ['myChild'] });
      expect(component.myChildren).toEqual(['myChild']);
    });

    it('gets no children', () => {
      const component = new Component({});
      expect(component.myChildren).toEqual([]);
    });
  });

  describe('caching', () => {
    [
      'componentWillReceiveProps',
      'UNSAFE_componentWillReceiveProps',
      'shouldComponentUpdate'
    ].forEach(lifecycle => {
      it(`invalidates cache on ${lifecycle}`, () => {
        Component.prototype[lifecycle] = () => undefined;
        childrenDecorator(Component.prototype, 'myChildren');

        const component = new Component({ children: 'myChild' });
        const myChildren = component.myChildren;
        expect(component.myChildren).toBe(myChildren);
        component[lifecycle](component.props, {}, null);
        expect(component.myChildren).not.toBe(myChildren);
        expect(component.myChildren).toBe(component.myChildren);
      });
    });
  });

  it('works without filterChildren', () => {
    childrenDecorator()(Component.prototype, 'myChildren');
  });

  it('does not work with invalid filterChildren', () => {
    expect(() => childrenDecorator(false as any)(Component.prototype, 'myChildren')).toThrow();
  });

  describe('find children', () => {
    beforeEach(() => {
      childrenDecorator(c => c === 'myChild')(
        Component.prototype,
        'myChildren'
      );
    });

    it('finds children from array', () => {
      const component = new Component({
        children: ['myOtherChild', 'myChild']
      });
      expect(component.myChildren).toEqual(['myChild']);
    });

    it('finds no children from array', () => {
      const component = new Component({ children: ['myOtherChild'] });
      expect(component.myChildren).toEqual([]);
    });
  });
});
