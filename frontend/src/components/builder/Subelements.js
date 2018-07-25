import React, { Component } from 'react';
import ElementSelect from './ElementSelect';
import TemplateInstance from './TemplateInstance';

import createTemplateInstance from '../../utils/templates';


export default class Subelements extends Component {
  addChild = (template) => {
    const instance = createTemplateInstance(template);
    this.props.addSubelement(instance);
  }

  getPath = () => {
    return 'subelements';
  }

  getChildsPath = (id) => {
    const artifactTree = this.props.instance;
    const childIndex = artifactTree.subelements.findIndex(instance => instance.uniqueId === id);
    return `${childIndex}`;
  }
  render() {
    return <div className="card-element__body">
      {this.props.instance.subelements.map((s, i) =>
          <TemplateInstance
            resources={this.props.resources}
            valueSets={this.props.valueSets}
            loadValueSets={this.props.loadValueSets}
            getPath={this.getChildsPath}
            treeName={this.props.treeName}
            templateInstance={s}
            otherInstances={[]}
            editInstance={this.props.editInstance}
            updateInstanceModifiers={this.props.updateInstanceModifiers}
            deleteInstance={this.props.deleteInstance}
            subpopulationIndex={this.props.subPopulationIndex}
            renderIndentButtons={() => {}}
            conversionFunctions={this.props.conversionFunctions}
            instanceNames={this.props.instanceNames}
            loginVSACUser={this.props.loginVSACUser}
            setVSACAuthStatus={this.props.setVSACAuthStatus}
            vsacStatus={this.props.vsacStatus}
            vsacStatusText={this.props.vsacStatusText}
            timeLastAuthenticated={this.props.timeLastAuthenticated}
            searchVSACByKeyword={this.props.searchVSACByKeyword}
            isSearchingVSAC={this.props.isSearchingVSAC}
            vsacSearchResults={this.props.vsacSearchResults}
            vsacSearchCount={this.props.vsacSearchCount}
            getVSDetails={this.props.getVSDetails}
            isRetrievingDetails={this.props.isRetrievingDetails}
            vsacDetailsCodes={this.props.vsacDetailsCodes}
            vsacFHIRCredentials={this.props.vsacFHIRCredentials}
            validateReturnType={this.props.validateReturnType} />
      )}

      <ElementSelect
        categories={this.props.templates}
        onSuggestionSelected={this.addChild}
        parameters={this.props.parameters}
        loginVSACUser={this.props.loginVSACUser}
        setVSACAuthStatus={this.props.setVSACAuthStatus}
        vsacStatus={this.props.vsacStatus}
        vsacStatusText={this.props.vsacStatusText}
        timeLastAuthenticated={this.props.timeLastAuthenticated}
        searchVSACByKeyword={this.props.searchVSACByKeyword}
        isSearchingVSAC={this.props.isSearchingVSAC}
        vsacSearchResults={this.props.vsacSearchResults}
        vsacSearchCount={this.props.vsacSearchCount}
        getVSDetails={this.props.getVSDetails}
        isRetrievingDetails={this.props.isRetrievingDetails}
        vsacDetailsCodes={this.props.vsacDetailsCodes}
        vsacFHIRCredentials={this.props.vsacFHIRCredentials}
        validateCode={this.props.validateCode}
      />
    </div>;
  }
}
