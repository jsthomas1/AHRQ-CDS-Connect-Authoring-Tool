  import React, { memo, useState, useCallback } from 'react';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useField, useFormikContext } from 'formik';
import clsx from 'clsx';

import { isCpgComplete } from 'utils/fields';
import { useFieldStyles } from 'styles/hooks';
import useStyles from './styles';

export default memo(function DateField({
  name,
  label,
  colSize = '1',
  helperText,
  noDateOption = false,
  noDateText = 'No Date',
  namePrefix,
  isCpgField = false
}) {
  const [noDateSelected, setNoDateSelected] = useState(false);
  const fieldName = namePrefix ? `${namePrefix}.${name}` : name;
  const [field, , { setValue }] = useField(fieldName);
  const { value } = field;
  const { values } = useFormikContext();
  const fieldStyles = useFieldStyles();
  const styles = useStyles();

  const toggleSelectNoDate = useCallback(() => {
    setValue(null);
    setNoDateSelected(currentValue => !currentValue);
  }, [setNoDateSelected, setValue]);

  return (
    <div className={clsx(fieldStyles.field, styles.fieldCentered)}>
      {label && (
        <label htmlFor={fieldName} className={fieldStyles.fieldLabel}>
          {label}
          {isCpgField && (
            <span className={clsx(styles.cpgTag, isCpgComplete(name, values) && styles.cpgTagComplete)}>CPG</span>
          )}
          :
        </label>
      )}

      <div className={clsx(fieldStyles.fieldInput, styles.dateFieldInput)}>
        <KeyboardDatePicker
          disabled={noDateSelected}
          format="MM/dd/yyyy"
          inputVariant="outlined"
          KeyboardButtonProps={{ 'aria-label': 'change date' }}
          label="Date"
          margin="normal"
          onChange={value => setValue(value)}
          placeholder="mm/dd/yyyy"
          value={value}
        />

        {helperText && <div className={fieldStyles.helperText}>{helperText}</div>}
      </div>

      {noDateOption && (
        <div className={styles.fieldCheckbox}>
          <FormControlLabel
            control={<Checkbox checked={noDateSelected} color="primary" onChange={toggleSelectNoDate} />}
            label={noDateText}
          />
        </div>
      )}
    </div>
  );
});
