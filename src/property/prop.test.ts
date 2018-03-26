// tslint:disable:no-string-literal
import * as React from 'react';
import { classOf, prop as propDecorator } from '../';

class TestComponent extends React.Component<{ myProp }> {
  myProp;
}

describe('@prop', () => {
  let Component: classOf<TestComponent>;

  beforeEach(() => {
    Component = class extends TestComponent {};
    propDecorator(Component.prototype, 'myProp');
  });

  it('gets prop', () => {
    const component = new Component({ myProp: 1 });
    expect(component.myProp).toBe(1);
  });

  it('gets undefined prop', () => {
    const component = new Component({});
    expect(component.myProp).toBeUndefined();
  });

  it('gets default prop from setter', () => {
    const component = new Component({});
    component.myProp = 1;
    expect(component.myProp).toBe(1);
    expect(Component['defaultProps'].myProp).toBe(1);
  });

  it('gets default prop from defaultProps', () => {
    const component = new Component({});
    Component['defaultProps'] = { myProp: 1 };
    expect(component.myProp).toBe(1);
  });
});
