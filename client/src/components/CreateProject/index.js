import React, { Component } from "react";
import "./style.css";
import AddedContributors from "./AddedContributors";
import SearchContributors from "./SearchContributors";
import API from "../../utils/API";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import mockAPI from "../../utils/mockAPI";

export default class CreateProject extends Component {
  state = {
    name: "",
    created_by: this.props.username,
    owners: [this.props.username],
    contributors: []
  };

  handleInput = field => event => {
    const { value } = event.target;
    this.setState({
      [field]: value
    });
  };

  handleRemoveContributor = toRemove => {
    console.log("Removing: ", toRemove);

    let contributors = this.state.contributors.filter(
      contributor => contributor !== toRemove
    );
    console.log(contributors);
    this.setState({ contributors });
  };

  handleAddContributor = toAdd => {
    if (!this.state.contributors.includes(toAdd)) {
      this.setState(prevState => {
        return { contributors: [...prevState.contributors, toAdd] };
      });
    }
  };

  handleCreateProject = () => {
    API.createProject({ ...this.state }).then(project => {
      window.location = `/project/${project._id}`;
    });
  };

  render() {
    return (
      <div>
        <ReactCSSTransitionGroup
          transitionName="modal"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          <div
            key="1"
            className="create-project-container"
            onClick={this.props.toggleCreateProjectDialog}
          >
            <div className="create-project-content-container">
              <div className="title">Create a new project</div>
              <input
                className="add-project-title-input"
                placeholder="Project Title"
                onChange={this.handleInput("name")}
              />
              <AddedContributors
                handleRemoveContributor={this.handleRemoveContributor}
                contributors={this.state.contributors}
              />
              <SearchContributors
                contributors={this.state.contributors}
                handleAddContributor={this.handleAddContributor}
              />
              <div
                className="add-project-button"
                onClick={this.handleCreateProject}
              >
                Create Project
              </div>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}