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

    it('caches children', () => {
      const component = new Component({ children: 'myChild' });
      expect(component.myChildren).toBe(component.myChildren);
    });

    it('recaches children', () => {
      const component = new Component({ children: 'myChild' });
      const myChildren = component.myChildren;
      component.shouldComponentUpdate!(component.props, {}, null);
      expect(component.myChildren).not.toBe(myChildren);
      expect(component.myChildren).toBe(component.myChildren);
    });
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
