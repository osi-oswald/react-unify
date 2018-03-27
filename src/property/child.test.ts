import * as React from 'react';
import { child as childDecorator, classOf } from '../';

class TestComponent extends React.Component<{ children }> {
  myChild;
}

describe('@child', () => {
  let Component: classOf<TestComponent>;

  beforeEach(() => {
    Component = class extends TestComponent {};
    childDecorator(Component.prototype, 'myChild');
  });

  it('gets child', () => {
    const component = new Component({ children: 'myChild' });
    expect(component.myChild).toBe('myChild');
  });

  it('gets no child', () => {
    const component = new Component({});
    expect(component.myChild).toBeNull();
  });
});
