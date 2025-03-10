import React, { memo, useMemo } from 'react';
import { FastField, useFormikContext } from 'formik';
import { TextField as MuiTextField } from '@material-ui/core';
import clsx from 'clsx';

import { isCpgComplete } from 'utils/fields';
import { useFieldStyles } from 'styles/hooks';
import useStyles from './styles';

let labelUuid = 0;

const MuiFastField = ({ field: { name, value, onChange, onBlur }, form: { touched, errors }, ...props }) => (
  <MuiTextField
    error={touched[name] && Boolean(errors[name])}
    fullWidth
    helperText={touched[name] && errors[name]}
    multiline
    name={name}
    onBlur={onBlur}
    onChange={onChange}
    value={value}
    variant="outlined"
    {...props}
  />
);

export default memo(function TextAreaField({
  name,
  label,
  placeholder,
  colSize = '1',
  helperText,
  namePrefix,
  isCpgField = false
}) {
  const { values } = useFormikContext();
  const fieldName = namePrefix ? `${namePrefix}.${name}` : name;
  const fieldStyles = useFieldStyles();
  const styles = useStyles();

  const labelId = useMemo(() => {
    if (!label) return null;
    return `TextAreaField-${labelUuid += 1}`;
  }, [label]);
  
  return (
    <div className={fieldStyles.field}>
      {label &&
        <label htmlFor={labelId} className={fieldStyles.fieldLabel}>
          {label}
          {isCpgField &&
            <span className={clsx(styles.cpgTag, isCpgComplete(name, values) && styles.cpgTagComplete)}>CPG</span>
          }:
        </label>
      }

      <div className={clsx(fieldStyles.fieldInput, fieldStyles.fieldInputFullWidth)}>
        <FastField
          component={MuiFastField}
          id={labelId}
          name={fieldName}
          placeholder={placeholder}
        />

        {helperText && <div className={fieldStyles.helperText}>{helperText}</div>}
      </div>
    </div>
  );
});
