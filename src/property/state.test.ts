import * as React from 'react';
import {classOf, state as stateDecorator} from '../';

class TestComponent extends React.Component<{}, { myState }> {
  myState;
  updater;
}

describe('@state', () => {
  let Component: classOf<TestComponent>;
  let originalSetState: jest.SpyInstance;

  beforeEach(() => {
    Component = class extends TestComponent {
    };
    originalSetState = jest.spyOn(Component.prototype, 'setState');
    stateDecorator(Component.prototype, 'myState');
  });

  it('augments setState only once', () => {
    const setState = Component.prototype.setState;
    stateDecorator(Component.prototype, 'myOtherState');
    expect(setState).toBe(Component.prototype.setState);
  });

  describe('updating state', () => {
    const update = {myState: 1};
    let component: TestComponent;

    beforeEach(() => {
      component = new Component();
    });

    describe('before componentWillMount', () => {
      it('gets undefined state', () => {
        expect(component.myState).toBeUndefined();
        expect(component.state).toBeUndefined();
      });

      it('sets state via assignment', () => {
        component.myState = update.myState;
        expect(component.myState).toBe(update.myState);
        expect(component.state.myState).toBe(update.myState);
        expect(originalSetState).toHaveBeenCalledTimes(0);
      });
    });

    describe('after componentWillMount', () => {
      beforeEach(() => {
        component.updater = newTestUpdater();
        component.componentWillMount!();
      });

      it('sets state via assignment', () => {
        component.myState = update.myState;
        expect(component.myState).toBe(update.myState);
        expect(component.state.myState).toBe(undefined);
        expect(originalSetState).toHaveBeenCalledWith(update);
      });

      it('sets state via setState update object', (done) => {
        component.setState(update, () => {
          expect(component.state.myState).toBe(update.myState);
          done();
        });
        expect(component.myState).toBe(update.myState);
        expect(component.state.myState).toBe(undefined);
        expect(originalSetState).toHaveBeenCalledWith(update, expect.any(Function));
      });

      it('sets state via setState update function', (done) => {
        const updateFn = (prevState) => update;
        component.setState(updateFn, () => {
          expect(component.myState).toBe(update.myState);
          expect(component.state.myState).toBe(update.myState);
          done();
        });
        expect(component.myState).toBe(undefined);
        expect(component.state.myState).toBe(undefined);
        expect(originalSetState).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
      });
    });
  });
});

function newTestUpdater() {
  return {
    enqueueSetState(instance: React.Component, update: null | {} | Function, callback: null | Function) {
      if (update) {
        setTimeout(() => {
          if (typeof update === 'function') {
            update = update.call(instance, instance.state, instance.props);
          }
          instance.state = {...instance.state, ...update};
          callback && callback();
        });
      }
    },
  };
}
