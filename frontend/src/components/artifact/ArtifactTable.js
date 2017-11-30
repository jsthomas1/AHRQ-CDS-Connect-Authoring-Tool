import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import { renderDate, sortMostRecent } from '../../helpers/utils';
import Modal from '../elements/Modal';
import EditArtifactModal from './EditArtifactModal';

export default class ArtifactTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      artifactEditing: null,
      name: '',
      version: '',
      artifactToDelete: null,
      showEditArtifactModal: false,
      showConfirmDeleteModal: false
    };
  }

  // ----------------------- EDIT ARTIFACT MODAL --------------------------- //

  openEditArtifactModal = (artifact) => {
    this.setState({
      showEditArtifactModal: true,
      artifactEditing: artifact,
      name: artifact.name,
      version: artifact.version
    });
  }

  closeEditArtifactModal = () => {
    this.setState({
      showEditArtifactModal: false,
      artifactEditing: null,
      name: '',
      version: ''
    });
  }

  handleEditArtifact = (event) => {
    const artifactToEdit = this.state.artifactEditing;
    artifactToEdit.name = this.state.name;
    artifactToEdit.version = this.state.version;

    this.props.editArtifact(artifactToEdit);
    this.closeEditArtifactModal();
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  // ----------------------- CONFIRM DELETE MODAL -------------------------- //

  openConfirmDeleteModal = (artifact) => {
    this.setState({ showConfirmDeleteModal: true, artifactToDelete: artifact });
  }

  closeConfirmDeleteModal = () => {
    this.setState({ showConfirmDeleteModal: false, artifactToDelete: null });
  }

  handleDeleteArtifact = () => {
    this.props.deleteArtifact(this.state.artifactToDelete);
    this.closeConfirmDeleteModal();
  }

  renderConfirmDeleteModal() {
    return (
      <Modal
        modalTitle="Delete Artifact Confirmation"
        modalId="confirm-delete-modal"
        modalTheme="light"
        modalSubmitButtonText="Delete"
        handleShowModal={this.state.showConfirmDeleteModal}
        handleCloseModal={this.closeConfirmDeleteModal}
        handleSaveModal={this.handleDeleteArtifact}>

        <div className="delete-artifact-confirmation-modal">
          <h5>Are you sure you want to permanently delete the following CDS Artifact?</h5>

          <div className="artifact-info">
            <span>Name: </span>
            <span>
              {this.state.artifactToDelete !== null ? this.state.artifactToDelete.name : 'name_placeholder'}
            </span>
          </div>

          <div className="artifact-info">
            <span>Version: </span>
            <span>
              {this.state.artifactToDelete !== null ? this.state.artifactToDelete.version : 'version_placeholder'}
            </span>
          </div>
        </div>
      </Modal>
    );
  }

  // ----------------------- ARTIFACT TABLE -------------------------------- //

  renderTableRow = artifact => (
    <tr key={artifact._id}>
      <td className="artifacts__tablecell-wide" data-th="Artifact Name">
        <Link to={`build/${artifact._id}`}>
          {artifact.name}
        </Link>
      </td>

      <td className="artifacts__tablecell-short"
        data-th="Version">
        {artifact.version}
      </td>

      <td data-th="Updated">{renderDate(artifact.updatedAt)}</td>

      <td data-th="">
        <button aria-label="Edit"
          className="primary-button edit-artifact-button"
          onClick={() => this.openEditArtifactModal(artifact)}>
          <FontAwesome name='pencil' />
        </button>

        <button className="danger-button"
          onClick={() => this.openConfirmDeleteModal(artifact)}>
          Delete
        </button>
      </td>
    </tr>
  );

  render() {
    const { artifacts } = this.props;

    return (
      <div className="artifact-table">
        <table className="artifacts__table">
          <thead>
            <tr>
              <th scope="col" className="artifacts__tablecell-wide">Artifact Name</th>
              <th scope="col" className="artifacts__tablecell-short">Version</th>
              <th scope="col">Last Updated</th>
              <td></td>
            </tr>
          </thead>

          <tbody>
            {artifacts.sort(sortMostRecent).map(this.renderTableRow)}
          </tbody>
        </table>

        <EditArtifactModal
          artifactEditing={this.state.artifactEditing}
          name={this.state.name}
          version={this.state.version}
          handleInputChange={this.handleInputChange}
          showModal={this.state.showEditArtifactModal}
          closeModal={this.closeEditArtifactModal}
          saveModal={this.handleEditArtifact} />

        {this.renderConfirmDeleteModal()}
      </div>
    );
  }
}

ArtifactTable.propTypes = {
  artifacts: PropTypes.array,
  editArtifact: PropTypes.func.isRequired,
  deleteArtifact: PropTypes.func.isRequired
};