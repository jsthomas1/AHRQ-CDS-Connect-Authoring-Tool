import React from 'react';
import BaseElements from '../BaseElements';
import { render, screen, userEvent } from 'utils/test-utils';
import { elementGroups, genericBaseElementInstance, genericBaseElementListInstance } from 'utils/test_fixtures';

describe('<BaseElements />', () => {
  const renderComponent = (props = {}) =>
    render(
      <BaseElements
        addBaseElement={jest.fn()}
        addInstance={jest.fn()}
        baseElements={[]}
        conversionFunctions={[]}
        deleteInstance={jest.fn()}
        editInstance={jest.fn()}
        externalCqlList={[]}
        getAllInstances={jest.fn()}
        getAllInstancesInAllTrees={jest.fn(() => [])}
        instance={null}
        instanceNames={[]}
        isLoadingModifiers={false}
        loadExternalCqlList={jest.fn()}
        modifierMap={{}}
        modifiersByInputType={{}}
        parameters={[]}
        scrollToElement={jest.fn()}
        templates={[]}
        treeName="baseElements"
        updateBaseElementLists={jest.fn()}
        updateInstanceModifiers={jest.fn()}
        validateReturnType={false}
        vsacApiKey="key"
        {...props}
      />
    );

  it('renders separate template instances', () => {
    const baseElements = [genericBaseElementInstance, genericBaseElementInstance];

    const { container } = renderComponent({
      baseElements,
      instance: { baseElements }
    });

    const templateInstanceHeaders = container.querySelectorAll('.card-element__header');
    expect(templateInstanceHeaders).toHaveLength(2);
    expect(templateInstanceHeaders[0]).toHaveTextContent('Observation');
    expect(templateInstanceHeaders[1]).toHaveTextContent('Observation');
  });

  it('can render a list group with conjunction and a template instance inside', () => {
    const baseElements = [genericBaseElementListInstance];
    const getAllInstances = jest.fn();

    getAllInstances.mockReturnValue(genericBaseElementListInstance.childInstances);

    const { container } = renderComponent({
      baseElements,
      getAllInstances,
      instance: { baseElements, uniqueId: 'uuid' },
      templates: elementGroups
    });

    // ListGroup renders a ConjunctionGroup
    const conjunctions = container.querySelectorAll('.subpopulations');
    expect(conjunctions).toHaveLength(1);

    // ConjunctionGroup renders a TemplateInstance and an ElementSelect
    const [conjunctionGroup] = conjunctions;
    const expressPhrase = conjunctionGroup.querySelectorAll('.expression-item');

    expect(expressPhrase[0]).toHaveTextContent('Union');
    expect(expressPhrase[1]).toHaveTextContent('of');
    expect(expressPhrase[2]).toHaveTextContent('VSAC Observation');

    const elementSelects = conjunctionGroup.querySelectorAll('.element-select');
    expect(elementSelects).toHaveLength(1);

    // The Type options in the Conjunction group match the List options, not the usual operations
    userEvent.click(screen.getByRole('button', { name: 'Union' }));

    const listOperations = elementGroups[3].entries;
    const menuOptions = screen.getAllByRole('option');
    expect(menuOptions).toHaveLength(2);
    expect(menuOptions[0]).toHaveTextContent(listOperations[0].name);
    expect(menuOptions[1]).toHaveTextContent(listOperations[1].name);
  });
});
