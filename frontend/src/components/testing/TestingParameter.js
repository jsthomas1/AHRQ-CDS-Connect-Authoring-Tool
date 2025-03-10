import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Editor from '../builder/editors/Editor';

export default class TestingParameter extends Component {
  updateParameter = (object) => {
    this.props.updateInstanceOfParameter(object, this.props.index);
  }

  renderParameter() {
    const editorProps = {
      id: `param-name-${this.props.index}`,
      name: this.props.name,
      type: this.props.type != null ? this.props.type : null,
      label: 'Value:',
      value: this.props.value,
      updateInstance: e => this.updateParameter({
        name: this.props.name,
        uniqueId: this.props.id,
        type: this.props.type,
        comment: this.props.comment,
        value: (e != null ? e.value : null)
      }),
      vsacApiKey: this.props.vsacApiKey
    };

    return <Editor {...editorProps} />;
  }

  render() {
    return (
      <div className="parameter card-group card-group__top" id={this.props.id}>
        <div className="card-element">
          <div className="card-element__header">
            {this.props.name}
          </div>
          <div className="card-element__body">
            {this.renderParameter()}
          </div>
        </div>
      </div>
    );
  }
}

TestingParameter.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string,
  type: PropTypes.string,
  updateInstanceOfParameter: PropTypes.func.isRequired,
  vsacApiKey: PropTypes.string
};
