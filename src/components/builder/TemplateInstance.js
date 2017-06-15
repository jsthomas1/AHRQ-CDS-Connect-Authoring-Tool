import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import FontAwesome from 'react-fontawesome';
import _ from 'lodash';
import NumberParameter from './parameters/NumberParameter';
import update from 'immutability-helper';
import IntegerParameter from './parameters/IntegerParameter';
import StringParameter from './parameters/StringParameter';
import ObservationParameter from './parameters/ObservationParameter';
import ValueSetParameter from './parameters/ValueSetParameter';
import ListParameter from './parameters/ListParameter';
import CaseParameter from './parameters/CaseParameter';
import StaticParameter from './parameters/StaticParameter';
import ComparisonParameter from './parameters/ComparisonParameter';
import CheckBoxParameter from './parameters/CheckBoxParameter';
import IfParameter from './parameters/IfParameter';
import BooleanParameter from './parameters/BooleanParameter';
import Config from '../../../config';
import Modifiers from '../../data/modifiers.js';
import LablModifier from './modifiers/LabelModifier';
import ValueComparison from './modifiers/ValueComparison';
const API_BASE = Config.api.baseUrl;

export function createTemplateInstance(template) {
  /*
    TODO: clone is required because we are setting value on the parameter.
    This may not be the best approach
  */
  const instance = _.cloneDeep(template);
  instance.uniqueId = _.uniqueId(instance.id);

  return instance;
}

function getInstanceName(instance) {
  return (instance.parameters.find(p => p.id === 'element_name') || {}).value;
}

function renderPreset(preset, stateIndex) {
  let name = 'untitled';
  const params = preset.parameters;
  const index = params.findIndex(item => item.id === 'element_name');
  if (index > -1) {
    name = params[index];
  }
  return (
    <option key={stateIndex} value={stateIndex}>
      {name.value}
    </option>
  );
}

class TemplateInstance extends Component {
  static propTypes = {
    templateInstance: PropTypes.object.isRequired,
    otherInstances: PropTypes.array.isRequired,
    updateSingleElement: PropTypes.func.isRequired,
    updateSingleElementModifiers: PropTypes.func.isRequired,
    deleteInstance: PropTypes.func.isRequired,
    saveInstance: PropTypes.func.isRequired,
    showPresets: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);


    this.modifierMap = _.keyBy(Modifiers, 'id');
    this.modifersByInputType = {}
    Modifiers.forEach((modifier) => { 
      modifier.inputTypes.forEach((inputType) => {
        this.modifersByInputType[inputType] = (this.modifersByInputType[inputType] || []).concat(modifier)
      });
    });

    this.state = {
      resources: {},
      presets: [],
      showElement: true,
      showPresets: false,
      relevantModifiers: (this.modifersByInputType[this.props.templateInstance.returnType] || []),
      appliedModifiers: []
    };

    this.updateInstance = this.updateInstance.bind(this);
    this.updateNestedInstance = this.updateNestedInstance.bind(this);
    this.updateList = this.updateList.bind(this);
    this.updateCase = this.updateCase.bind(this);
    this.updateIf = this.updateIf.bind(this);
    this.selectTemplate = this.selectTemplate.bind(this);
    
    // TODO: all this modifier stuff should probably be pulled out into another component
    this.renderAppliedModifiers = this.renderAppliedModifiers.bind(this);
    this.renderAppliedModifier = this.renderAppliedModifier.bind(this);
    this.renderModifierSelect = this.renderModifierSelect.bind(this);
    this.removeLastModifier = this.removeLastModifier.bind(this);
    this.updateAppliedModifier = this.updateAppliedModifier.bind(this);
    this.handleModifierSelected = this.handleModifierSelected.bind(this);
    this.filterRelevantModifiers = this.filterRelevantModifiers.bind(this);

    this.notThisInstance = this.notThisInstance.bind(this);
    this.addComponent = this.addComponent.bind(this);
    this.updateComparison = this.updateComparison.bind(this);
    this.addCaseComponent = this.addCaseComponent.bind(this);
    this.addIfComponent = this.addIfComponent.bind(this);
  }

  componentWillMount() {
    this.props.templateInstance.parameters.forEach((param) => {
      this.setState({ [param.id]: param.value });
    });

    const otherInstances = this.getOtherInstances(this.props);
    this.setState({ otherInstances });

    axios.get(`${API_BASE}/config/resources`)
      .then((result) => {
        this.setState({ resources: result.data });
      });
  }

  componentWillReceiveProps(nextProps) {
    const otherInstances = this.getOtherInstances(nextProps);
    this.setState({ otherInstances });
  }

  // Props will either be this.props or nextProps coming from componentWillReceiveProps
  getOtherInstances(props) {
    const otherInstances = props.otherInstances.filter(this.notThisInstance).map(
      instance => ({ name: getInstanceName(instance),
        id: instance.id,
        returnType: instance.returnType }));
    return otherInstances;
  }

  notThisInstance(instance) {
    // Look up by uniqueId to correctly identify the current instance
    // For example, "and" elements have access to all other "and" elements besides itself
    // They have different uniqueId's but the id's of all "and" elements is "And"
    return this.props.templateInstance.uniqueId !== instance.uniqueId;
  }

  // getInstanceName(instance) {
  //   return (instance.parameters.find(p => p.id === 'element_name') || {}).value;
  // }

  updateInstance(newState) {
    this.setState(newState);
    this.props.updateSingleElement(this.props.templateInstance.uniqueId, newState);
  }

  // Used to update value states that are nested objects
  updateNestedInstance(id, value, element) {
    const newState = {};
    newState[id] = Object.assign({}, this.state[id]);
    newState[id][element] = value;
    this.updateInstance(newState);
  }

  updateList(id, value, index) {
    const newState = {};
    const arrayvar = this.state[id].slice();
    arrayvar[index] = value;
    newState[id] = arrayvar;
    this.updateInstance(newState);
  }

  addComponent(listParameter) {
    const arrayvar = this.state[listParameter].slice();
    arrayvar.push(undefined);
    const newState = { [listParameter]: arrayvar };
    this.updateInstance(newState);
  }

  // Updates a case statement based on case or result
  updateCase(id, value, index, option) {
    const array = this.state[id].cases.slice();
    array[index][option] = value;
    this.updateNestedInstance(id, array, 'cases');
  }

  // Adds a new row of case statements
  addCaseComponent(id) {
    const array = this.state[id].cases.slice();
    array.push({ case: null, result: null });
    this.updateNestedInstance(id, array, 'cases');
  }

  // Updates an if statemement with selected value
  updateIf(paramId, value, index, place) {
    const valueArray = this.state[paramId].slice();
    // Mongoose stops empty objects from being saved, so this will be null if it wasn't set yet
    if (_.isNil(valueArray[index])) {
      valueArray[index] = {};
    }
    valueArray[index][place] = value;
    const newState = {};
    newState[paramId] = valueArray;
    this.updateInstance(newState);
  }

  // Adds new Condition/Block for If statements
  addIfComponent(paramId) {
    const currentParamValue = this.state[paramId].slice();
    currentParamValue.splice(currentParamValue.length - 1, 0, {});
    const newState = {};
    newState[paramId] = currentParamValue;
    this.updateInstance(newState);
  }

  updateComparison(isSingledSided) {
    // TODO: Refactor this function to use React State
    const parameter = this.props.templateInstance.parameters;
    if (isSingledSided) {
      _.remove(parameter, param =>
        // Remove any instance with id ending in '_2'
         (RegExp('^.*(?=(_2))').test(param.id)));
      _.find(parameter, { id: 'comparison_bound' }).name = 'Comparison Bound';
      _.last(parameter).name = 'Double Sided?';
    } else {
      const lowerBound = _.find(parameter, { id: 'comparison_bound' });
      const upperBound = _.clone(lowerBound);
      lowerBound.name = 'Lower Comparison Bound';
      upperBound.name = 'Upper Comparison Bound';
      upperBound.id = `${upperBound.id}_2`;
      upperBound.value = undefined;

      // Using name for readability, could've been id, but {'id': 'Comparison'} isn't obvious
      const secondOperator = _.clone(_.find(parameter, { name: 'Operator' }));
      secondOperator.id = `${secondOperator.id}_2`;
      secondOperator.value = null;

      _.last(parameter).name = 'Single Sided?';
      parameter.splice(parameter.length - 1, 0, secondOperator);
      parameter.splice(parameter.length - 1, 0, upperBound);
    }
    // setState merges what you provide to the currentState, so this merely forces a re-render
    this.setState({});
  }

  renderAppliedModifier(modifier, index) {
    switch (modifier.id) {
      case 'ValueComparison':
        return (
          <ValueComparison
            key={index}
            index={index}
            min={modifier.values.min}
            updateAppliedModifier={this.updateAppliedModifier}/>
        );
      default:
        return (<LablModifier key={index} name={modifier.name} id={modifier.id}/>);;
    }

    return (
      <div key={index}>{modifier.name}</div>
    )
  }

  renderAppliedModifiers() {
    return (
      <div>
        {this.state.appliedModifiers.map((modifier, index) => 
          this.renderAppliedModifier(modifier, index)
        )}
      </div>
    );

  }

  filterRelevantModifiers(returnType) {
    if (_.isUndefined(returnType)) {
      returnType = (_.last(this.state.appliedModifiers) || this.props.templateInstance).returnType;
    }
    console.log("FILTER BY: " + returnType);
    this.setState({relevantModifiers: (this.modifersByInputType[returnType] || [])});
  }

  handleModifierSelected(event) {
    let selectedModifier = this.modifierMap[event.target.value]
    this.setAppliedModifiers(this.state.appliedModifiers.concat([selectedModifier]));
    event.target.value="" // reset the select box
  }

  updateAppliedModifier(index, value) {
    this.setAppliedModifiers(update(this.state.appliedModifiers, {[index]: {values: {$set: value}} }));
  }
  setAppliedModifiers(appliedModifiers) {
    this.setState({appliedModifiers: appliedModifiers}, this.filterRelevantModifiers);
    this.props.updateSingleElementModifiers(this.props.templateInstance.uniqueId, appliedModifiers);
  }

  removeLastModifier() {
    let newAppliedModifiers = this.state.appliedModifiers.slice();
    newAppliedModifiers.pop();
    this.setAppliedModifiers(newAppliedModifiers)
  }

  renderModifierSelect() {
    // filter modifiers?
    return (
      <div>
        { (this.state.relevantModifiers.length > 0)
          ? <select onChange={this.handleModifierSelected}>
              <option value="" selected disabled>add expression</option>
              {this.state.relevantModifiers.map((modifier) => 
                <option key={modifier.id} value={modifier.id}>{modifier.name}</option>
              )}
            </select>
          : null}
        { (this.state.appliedModifiers.length > 0)
          ? <button
            onClick={this.removeLastModifier}
            className="element__deletebutton"
            aria-label={'remove last expression'}>
            Remove Expression</button>
          : null}
      </div>
    );
  }

  selectTemplate(param) {
    if (param.static) {
      return (
          <StaticParameter
            key={param.id}
            param={param}
            updateInstance={this.updateInstance} />
      );
    }
    switch (param.type) {
      case 'number':
        return (
          <NumberParameter
            key={param.id}
            param={param}
            value={this.state[param.id]}
            typeOfNumber={param.typeOfNumber}
            updateInstance={this.updateInstance} />
        );
      case 'observation':
        return (
          <ObservationParameter
            key={param.id}
            param={param}
            resources={this.state.resources}
            updateInstance={this.updateInstance} />
        );
      case 'boolean':
        return (
          <BooleanParameter
            key={param.id}
            param={param}
            updateInstance={this.updateInstance} />
        );
      case 'string':
        return (
          <StringParameter
            key={param.id}
            {...param}
            updateInstance={this.updateInstance} />
        );
      case 'valueset':
        return (
          <ValueSetParameter
            key={param.id}
            param={param}
            valueset={this.state.resources}
            updateInstance={this.updateInstance} />
        );
      case 'list':
        return (
          <ListParameter
            key={param.id}
            param={param}
            value={this.state[param.id]}
            values={this.state.otherInstances}
            joinOperator={this.props.templateInstance.name}
            addComponent={this.addComponent}
            updateList={this.updateList} />
        );
      case 'comparison':
        return (
          <ComparisonParameter
          key={param.id}
          param={param}
          value={null}
          updateInstance={this.updateInstance} />
        );
      case 'checkbox':
        return (
          <CheckBoxParameter
          key={param.id}
          param={param}
          updateComparison={this.updateComparison} />
        );
      case 'if':
        return (
          <IfParameter
            key={param.id}
            values={this.state.otherInstances}
            param={param}
            updateIfStatement={this.updateIf}
            addIfComponent={this.addIfComponent}
            value={this.state[param.id]} />
        );
      case 'case':
        return (
          <CaseParameter
            key={param.id}
            param={param}
            value={this.state[param.id]}
            values={this.state.otherInstances}
            addComponent={this.addCaseComponent}
            updateCase={this.updateCase}
            updateInstance={this.updateNestedInstance} />
        );
      default:
        return undefined;
    }
  }

  showPresets(id) {
    this.setState({ showPresets: !this.state.showPresets });
    this.props.showPresets(id)
      .then((result) => {
        this.setState({ presets: result.data });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ presets: [] });
      });
  }

  setPreset(stateIndex) {
    if (!this.state.presets || _.isNaN(_.toNumber(stateIndex))) return;
    this.props.templateInstance.parameters = this.state.presets[stateIndex].parameters;
    for (let i = 0; i < this.state.presets[stateIndex].parameters.length; i++) {
      const param = this.state.presets[stateIndex].parameters[i];
      const newState = {};
      newState[param.id] = param.value;
      this.updateInstance(newState);
    }
  }

  showHideElementBody() {
    this.setState({ showElement: !this.state.showElement });
  }

  renderBody() {
    return (
      <div className="element__body">
      <div>
        {this.props.templateInstance.parameters.map((param, index) =>
          // todo: each parameter type should probably have its own component
          this.selectTemplate(param)
        )}
        </div>
        {this.renderAppliedModifiers()}
        {this.renderModifierSelect()}
      </div>);
  }

  render() {
    return (
      <div className="element element__expanded">
        <div className="element__header">
          <span className="element__heading">
            {this.props.templateInstance.name}
          </span>
          <div className="element__buttonbar">
            <button
              id={`presets-${this.props.templateInstance.id}`}
              aria-controls={`presets-list-${this.props.templateInstance.id}`}
              onClick={this.showPresets.bind(this, this.props.templateInstance.id)}
              className="element__presetbutton"
              aria-label={`show presets ${this.props.templateInstance.id}`}>
              <FontAwesome fixedWidth name='database'/>
            </button>
            <button
              onClick={this.props.saveInstance.bind(this, this.props.templateInstance.uniqueId)}
              className="element__savebutton"
              aria-label={`save ${this.props.templateInstance.name}`}>
              <FontAwesome fixedWidth name='save'/>
            </button>
            <button
              onClick={this.showHideElementBody.bind(this)}
              className="element__hidebutton"
              aria-label={`hide ${this.props.templateInstance.name}`}>
              <FontAwesome fixedWidth name={this.state.showElement ? 'angle-double-down' : 'angle-double-right'}/>
            </button>
            <button
              onClick={this.props.deleteInstance.bind(this, this.props.templateInstance.uniqueId)}
              className="element__deletebutton"
              aria-label={`remove ${this.props.templateInstance.name}`}>
              <FontAwesome fixedWidth name='close'/>
            </button>
            <div id={`presets-list-${this.props.templateInstance.id}`} role="region" aria-live="polite">
              { this.state.showPresets
                ? <select
                    onChange={event => this.setPreset(event.target.value)}
                    onBlur={event => this.setPreset(event.target.value)}
                    aria-labelledby={`presets-${this.props.templateInstance.id}`}>
                  <optgroup><option>Use a preset</option></optgroup>
                  {this.state.presets.map((preset, i) =>
                    renderPreset(preset, i)
                  )}
                </select>
                : null
              }
            </div>
          </div>
        </div>
        <div>
          { this.state.showElement ? this.renderBody() : null }
        </div>
      </div>
    );
  }
}

export default TemplateInstance;
