import React from 'react';
import { NavLink } from 'react-router-dom';

export default () => (
  <div className="landing" id="maincontent">
    <div className="landing-wrapper">
      <h2>Welcome to the Clinical Decision Support Authoring Tool</h2>

      <p>
        Build and export your first Clinicial Decision Support artifact by clicking
        <NavLink to="/build"> here</NavLink>.
      </p>

      <h3>About</h3>

      <p>
        The <strong>CDS Authoring Tool</strong> is a key part of CDS Connect, a project sponsored by the &nbsp;
        <a href="https://www.ahrq.gov/">Agency for Healthcare Research and Quality</a> that will offer a systematic
        and replicable process for transforming patient-centered outcomes research (PCOR) findings into shareable and
        standards-based clinical decision support (CDS) digital, computable artifacts.
      </p>

      <p>
        The CDS Authoring Tool, along with the <a href="https://cds.ahrq.gov">CDS Connect Repository</a>, will
        promote the creation and use of CDS in everyday clinical settings, and that it will serve as the linchpin for
        connecting high-quality CDS to the U.S. healthcare community.
      </p>

      <p>
        As an alpha capability, the CDS Authoring Tool is targeted to a select audience for internal testing and
        validation. It lacks many of the features that would be required for the final production version. As we move
        to beta, the target audience will need to be expanded to a broader set of users for testing, validation, and
        usability acceptance.
      </p>
    </div>
  </div>
);