import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore as reduxCreateMockStore } from 'redux-test-utils';
import _ from 'lodash';
import nock from 'nock';
import * as types from 'actions/types';
import localModifiers from 'data/modifiers';
import { render, fireEvent, userEvent, screen } from 'utils/test-utils';
import { simpleObservationInstanceTree, simpleConditionInstanceTree, artifact, reduxState } from 'utils/test_fixtures';
import { getFieldWithId } from 'utils/instances';
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

const renderComponent = ({ store = createMockStore(defaultState), ...props } = {}) =>
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

describe('Test the existence of certain modifiers across the Builder component', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/authoring/api/config/valuesets/demographics/units_of_time')
      .reply(200, { expansion: [] });
  });

  describe('Test that certain modifiers appear given current return type of list_of_observations', () => {
    describe('Test FirstObservation Modifier', () => {
      it('should dispatch UPDATE_ARTIFACT when added & saved.', () => {
        const store = createMockStore(getDefaultStateWithInstanceTree(simpleObservationInstanceTree));

        renderComponent({
          store
        });

        userEvent.click(screen.getAllByRole('button', { name: 'Add expression' })[0]);
        userEvent.click(screen.getByRole('button', { name: 'First' }));

        const updateAction = expandAction(_.last(store.getActions()));
        const [ instance ] = updateAction.artifact.expTreeInclude.childInstances;
        const [ modifier ] = instance.modifiers;

        expect(updateAction).toBeDefined();
        expect(updateAction.type).toEqual(types.UPDATE_ARTIFACT);
        expect(modifier.id).toEqual('FirstObservation');
        expect(modifier.name).toEqual('First');
      });
    });

    describe('Test AverageObservation Modifier', () => {
      it('should dispatch UPDATE_ARTIFACT when added', () => {
        const store = createMockStore(getDefaultStateWithInstanceTree(simpleObservationInstanceTree));

        renderComponent({
          store
        });

        userEvent.click(screen.getAllByRole('button', { name: 'Add expression' })[0]);
        userEvent.click(screen.getByRole('button', { name: 'Average Observation Value' }));

        const updateAction = expandAction(_.last(store.getActions()));
        const [ instance ] = updateAction.artifact.expTreeInclude.childInstances;
        const [ modifier ] = instance.modifiers;

        expect(updateAction).toBeDefined();
        expect(updateAction.type).toEqual(types.UPDATE_ARTIFACT);
        expect(modifier.id).toEqual('AverageObservationValue');
        expect(modifier.name).toEqual('Average Observation Value');
      });
    });
  });
});

// describe('Test that certain modifiers appear given the current return type is list_of_conditions', () => {
//   describe('Test FirstCondition modifier', () => {
//     const booty = createMockStore(getDefaultStateWithInstanceTree(simpleObservationInstanceTree));

//     renderComponent({
//       booty
//     });

//     it('should dispatch UPDATE_ARTIFACT when added', () => {});
//   });
// });

