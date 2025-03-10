import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';

import useStyles from './styles';

const CodeListTemplate = ({ codes, handleDeleteCode }) => {
  const styles = useStyles();

  return (
    <>
      {codes.map((code, index) => (
        <div key={`code-${index}`} className={styles.templateField}>
          <div className={styles.templateFieldLabel} id="code-label">
            Code{codes.length > 1 && ` ${index + 1}`}:
          </div>

          <div className={styles.templateFieldDetails}>
            <div className={styles.templateFieldDisplay}>
              {`${code.codeSystem.name} (${code.code}) ${code.display === '' ? '' : ` - ${code.display}`}`}
            </div>

            <div className={styles.templateFieldButtons}>
              <IconButton
                aria-label={`delete code ${code.codeSystem.name} (${code.code})`}
                color="primary"
                onClick={() => handleDeleteCode(code)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

CodeListTemplate.propTypes = {
  codes: PropTypes.array.isRequired,
  handleDeleteCode: PropTypes.func.isRequired
};

export default CodeListTemplate;
