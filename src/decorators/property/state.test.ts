import * as React from 'react';
import { state as stateDecorator } from './state';

class TestComponent extends React.Component<{}, { myState }> {
  myState;
  updater;
}

describe('@state', () => {
  let Component: typeof TestComponent;
  let setState: jest.SpyInstance;

  beforeEach(() => {
    Component = class extends TestComponent {};
    setState = jest.spyOn(Component.prototype, 'setState');
    stateDecorator(Component.prototype, 'myState');
  });

  it('augments componentWillUpdate only once', () => {
    const componentWillUpdate = Component.prototype.componentWillUpdate;
    stateDecorator(Component.prototype, 'myOtherState');
    expect(componentWillUpdate).toBe(Component.prototype.componentWillUpdate);
  });

  describe('updating state', () => {
    const update = { myState: 1 };
    let component: TestComponent;

    beforeEach(() => {
      component = new Component({});
    });

    describe('unmounted', () => {
      it('gets undefined state', () => {
        expect(component.myState).toBeUndefined();
        expect(component.state).toBeUndefined();
      });

      it('sets state via assignment', () => {
        component.myState = update.myState;
        expect(component.myState).toBe(update.myState);
        expect(component.state.myState).toBe(update.myState);
        expect(setState).toHaveBeenCalledTimes(0);
      });
    });

    describe('mounted', () => {
      beforeEach(() => {
        component.updater = mountedUpdater;
      });

      it('sets state via assignment', () => {
        component.myState = update.myState;
        expect(component.myState).toBe(update.myState);
        expect(component.state.myState).toBe(undefined);
        expect(setState).toHaveBeenCalledWith(update);
      });

      it('sets state from setState', done => {
        component.setState(update, () => {
          expect(component.myState).toBe(update.myState);
          expect(component.state.myState).toBe(update.myState);
          done();
        });
        expect(component.myState).toBe(undefined);
        expect(component.state).toBe(undefined);
      });

      it('does not mutate this.state', () => {
        component.componentWillUpdate!(component.props, component.state, null);
        component.myState = update.myState;
        expect(component.myState).toBe(update.myState);
        expect(component.state.myState).toBe(undefined);
      });
    });
  });
});

const mountedUpdater = {
  isMounted() {
    return true;
  },
  enqueueSetState(
    instance: React.Component,
    update: null | {} | Function,
    callback: null | Function
  ) {
    setTimeout(() => {
      const nextState = { ...instance.state, ...update };
      instance.componentWillUpdate!(instance.props, nextState, null);
      instance.state = nextState;
      callback && callback();
    });
  }
};
