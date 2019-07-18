import React, { Component } from 'react';
import _ from 'lodash';

// this.props are from a templateInstance parameters object,
// and a function called UpdateInstance that takes an object with
// key-value pairs that represents that state of the templateInstance
export default class NumberParameter extends Component {
  constructor(props) {
    super(props);
    this.state = { checked: this.props.param.exclusive };
  }

  updateExclusive = (event) => {
    this.props.param.exclusive = event.target.checked;
    this.setState({ checked: event.target.checked });
  }

  render() {
    const { value } = this.props;
    const id = _.uniqueId('parameter-');

    return (
      <div className="number-parameter">
        <div className='form__group'>
          <label htmlFor={id}>
            <div className="label">{this.props.param.name}:</div>

            <div className="input">
              <input
                id={id}
                type="number"
                name={this.props.param.id}
                value={(value || value === 0) ? value : ''} // if .value is undefined, will switch between controlled and uncontrolled input. See https://github.com/twisty/formsy-react-components/issues/66
                onChange={(event) => {
                  // eslint-disable-next-line max-len
                  const newValue = (this.props.typeOfNumber === 'integer') ? parseInt(event.target.value, 10) : parseFloat(event.target.value);
                  this.props.updateInstance({ [event.target.name]: newValue });
                }}
              />
              { ('exclusive' in this.props.param)
              ? <div className="form__caption">
                  <input id={`${id}-exclusive`}
                    type='checkbox'
                    checked={this.state.checked}
                    onChange={event => this.updateExclusive(event)}/>
                  <label htmlFor={`${id}-exclusive`}>{'Exclusive'}</label>
                </div>
              : null }
            </div>
          </label>
        </div>
      </div>
    );
  }
}
