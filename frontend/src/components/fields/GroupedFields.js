import React, { memo, useCallback } from 'react';
import { FieldArray } from 'formik';
import { Button, IconButton, Paper } from '@material-ui/core';
import { Add as AddIcon, Close as CloseIcon } from '@material-ui/icons';
import clsx from 'clsx';

import { isCpgComplete } from 'utils/fields';
import { useFieldStyles } from 'styles/hooks';
import useStyles from './styles';

const FastGroupedField = memo(({ name, colSize, index, remove, fields }) => {
  const handleRemove = useCallback(() => remove(index), [remove, index]);
  const namePrefix = `${name}[${index}]`;
  const fieldStyles = useFieldStyles();
  const styles = useStyles();

  return (
    <Paper className={styles.fieldGroupContainer}>
      <div className={styles.fieldGroupCloseButton}>
        <IconButton aria-label="close" color="primary" onClick={handleRemove}>
          <CloseIcon />
        </IconButton>
      </div>

      {fields.map(field => {
        const FormComponent = field.component;

        return (
          <FormComponent
            className={fieldStyles.fieldInput}
            key={field.name}
            name={field.name}
            namePrefix={namePrefix}
            {...field}
          />
        );
      })}
    </Paper>
  );
});

const FastGroupedFieldArray = memo(({
    name, label, colSize, buttonText, fields, values, defaultValue, push, remove, isCpgField
  }) => {
    const hasGroupedFields = values[name].length > 0;
    const addGroup = useCallback(() => push(defaultValue), [push, defaultValue]);
    const cpgFieldComplete = isCpgComplete(name, values);
    const fieldStyles = useFieldStyles();
    const styles = useStyles();

    return (
      <div className={clsx(fieldStyles.field, styles.groupedFields)}>
        <label htmlFor={name} className={fieldStyles.fieldLabel}>
          {label}
          {isCpgField && <span className={clsx(styles.cpgTag, cpgFieldComplete && styles.cpgTagComplete)}>CPG</span>}:
        </label>

        <div className={styles.fieldGroups}>
          {hasGroupedFields && (
            <div className={styles.fieldGroup}>
              {values[name].map((value, index) => (
                <FastGroupedField
                  name={name}
                  key={index}
                  colSize={colSize}
                  index={index}
                  remove={remove}
                  fields={fields}
                />
              ))}
            </div>
          )}

          <div className={fieldStyles.fieldInput}>
            <Button
              color="primary"
              onClick={addGroup}
              startIcon={<AddIcon />}
              variant="contained"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

export default memo(function GroupedFields({
  name,
  label,
  colSize = '1',
  buttonText = 'Add',
  fields = [],
  defaultValue = {},
  isCpgField = false,
  isCpgComplete
}) {
  return (
    <FieldArray
      name={name}
      render={({ push, remove, form }) => (
        <FastGroupedFieldArray
          name={name}
          label={label}
          colSize={colSize}
          buttonText={buttonText}
          fields={fields}
          values={form.values}
          push={push}
          remove={remove}
          defaultValue={defaultValue}
          isCpgField={isCpgField}
          isCpgComplete={isCpgComplete}
        />
      )}
    />
  );
});
