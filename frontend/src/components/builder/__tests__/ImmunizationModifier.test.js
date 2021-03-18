
import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore as reduxCreateMockStore } from 'redux-test-utils';
import _ from 'lodash';
import nock from 'nock';
import * as types from 'actions/types';
import localModifiers from 'data/modifiers';
import { render, userEvent, screen } from 'utils/test-utils';
import { simpleImmunizationInstanceTree, artifact, reduxState } from 'utils/test_fixtures';
import Builder from '../../../containers/Builder';

const modifierMap = _.keyBy(localModifiers, 'id');
const modifiersByInputType = {};

localModifiers.forEach(modifier => {
  modifier.inputTypes.forEach(inputType => {
    modifiersByInputType[inputType] = (modifiersByInputType[inputType] || []).concat(modifier);
  });
});

const createMockStore = state => {
  const store = reduxCreateMockStore(state);
  const { dispatch } = store;

  store.dispatch = (...args) => {
    dispatch(...args);
    return Promise.resolve({ templates: state.templates.templates });
  };

  return store;
};

const expandAction = action => {
  let args;
  action(actionArgs => (args = actionArgs));
  return args;
};

const renderComponent = ({ store, ...props } = {}) =>
  render(
    <Provider store={store}>
      <Builder match={{ params: {} }} {...props} />
    </Provider>
  );

const getDefaultStateWithInstanceTree = instanceTree => {
  return {
    ...reduxState,
    artifacts: {
      ...reduxState.artifacts,
      artifact: {
        ...artifact,
        expTreeInclude: instanceTree
      }
    },
    modifiers: {
      ...reduxState.modifiers,
      modifierMap,
      modifiersByInputType
    }
  };
};

describe('Test that certain modifiers appear given current return type of list_of_conditions', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/authoring/api/config/valuesets/demographics/units_of_time')
      .reply(200, { expansion: [] });
  });

  describe('Test FirstImmunization Modifier', () => {
    const store = createMockStore(getDefaultStateWithInstanceTree(simpleImmunizationInstanceTree));

    renderComponent({
      store
    });

    userEvent.click(screen.getAllByRole('button', { name: 'Add expression' })[0]);
    const targetElement = screen.getByRole('button', { name: 'First' });

    it('should render First as a modifier option within a button', () => {
      expect(targetElement).toBeDefined();
    });

    userEvent.click(targetElement);
    const updateAction = expandAction(_.last(store.getActions()));
    const [instance] = updateAction.artifact.expTreeInclude.childInstances;
    const [modifier] = instance.modifiers;

    it('should dispatch UPDATE_ARTIFACT when added.', () => {
      expect(updateAction).toBeDefined();
      expect(updateAction.type).toEqual(types.UPDATE_ARTIFACT);
      expect(modifier.id).toEqual('FirstImmunization');
      expect(modifier.name).toEqual('First');
    });
  });
});
