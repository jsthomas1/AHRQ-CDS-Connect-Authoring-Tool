import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import classnames from 'classnames';
import _ from 'lodash';

export default class TimeEditor extends Component {
  assignValue = (evt) => {
    let time = evt != null ? evt.format('HH:mm:ss') : null;
    time = time ? `@T${time}` : null;
    return time;
  }

  render() {
    const { name, type, label, value, updateInstance, condenseUI } = this.props;
    const formId = _.uniqueId('editor-');

    return (
      <div className="editor time-editor">
        <div className="form__group">
          <label
            className={classnames('editor-container', { condense: condenseUI })}
            htmlFor={formId}
          >
            <div className="editor-label label">{label}</div>

            <div className="editor-input-group">
              <div className="editor-input">
                <TimePicker
                  id={formId}
                  defaultValue={moment(value, 'HH:mm:ss').isValid() ? moment(value, 'HH:mm:ss') : null}
                  autoComplete="off"
                  onChange={ (e) => {
                    updateInstance({ name, type, label, value: this.assignValue(e) });
                  }}
                />
              </div>
            </div>
          </label>
        </div>
      </div>
    );
  }
}

TimeEditor.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  updateInstance: PropTypes.func.isRequired,
  condenseUI: PropTypes.bool
};