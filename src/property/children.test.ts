import * as React from 'react';
import { classOf } from '../utils';
import { children as childrenDecorator } from './children';

class TestComponent extends React.Component<{ children }> {
  myChildren;
}

describe('@children', () => {
  let Component: classOf<TestComponent>;

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

    it('gets child from array', () => {
      const component = new Component({ children: ['myChild'] });
      expect(component.myChildren).toEqual(['myChild']);
    });

    it('gets no child', () => {
      const component = new Component({});
      expect(component.myChildren).toEqual([]);
    });
  });

  describe('find children', () => {
    beforeEach(() => {
      childrenDecorator(c => c === 'myChild')(Component.prototype, 'myChildren');
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
