const db = require("../models");

assignProjectToUser = (userId, projectId) => { //puts a project into a user's projects field
    return db.User.findOne({_id: userId})
        .then(result => { //result is an array of users, we just want the first one
            if(result.projects.indexOf(projectId) == -1){
                result.projects.push(projectId);
                return db.User.updateOne({_id: userId}, result, {new: true, useFindAndModify: false}) //update returns the new user with new: true
                    .then(update => "Success");
            } else {
                throw "User already has this project.";
            }
        }).catch(err => err);
}

removeProjectFromUser = (userId, projectId) => { //removes a project from a user's projects field
    return db.User.findOne({_id: userId})
        .then(result => { //result is an array of user, we just want the first one
            result.projects = result.projects.filter( //returns a filtered array where
                id => id != projectId //the id of the project is not the project being removed
            );
            return db.User.updateOne({_id: userId}, result, {new: true, useFindAndModify: false})
                .then(update => /*return*/ "Success");
        }).catch(err => err);
}

assignUserToProject = (params, userType) => { //puts a user into a project's owner or contributor fields
    return db.Project.findOne({_id: params.projectId})
        .then(result => { //result is an array of projects, we just want the first one
            if(result.owners.indexOf(params.userId) != -1 || result.contributors.indexOf(params.userId) != -1){
                throw "User is already a part of the project."
            }
            if(userType === "owner"){ //if user is being added as owner
                result.owners.push(params.userId); //push to owners
            }
            if(userType === "contributor"){ //if user is being added as contributor
                result.contributors.push(params.userId); //push to contributors
            }
            return db.Project.updateOne({_id: params.projectId}, result, {new: true, useFindAndModify: false})
                .then(update => /*return*/ "Success");
        }).catch(err => err);
}

removeUserFromProject = (params, userType) => { //removes a user from a project's owner or contributor fields
    return db.Project.findOne({_id: params.projectId})
        .then(result => { //result is an array of projects, we just want the first one
            if(userType === "owner" && result.owners.length == 1){ //if the user being removed is an owner, AND there is more than one owner
                throw "Prota does not allow for ownerless projects.";
            } else if(userType === "owner"){
                result.owners = result.owners.filter( //returns a filtered array where
                    id => id !== params.userId //the username of the User is not the User being removed
                );
            }
            if(userType === "contributor"){ //if the user being removed is a contributor
                result.contributors = result.contributors.filter( //returns a filtered array where
                    id => id !== params.userId //the username of the User is not the User being removed
                );
            }
            return db.Project.updateOne({_id: params.projectId}, result, {new: true, useFindAndModify: false})
                .then(update => /*return*/ "Success");
        }).catch(err => err);
}

module.exports = {
    getAllByUser: function(userId){ //get all projects by req.user
        return db.User
            .findOne({_id: userId}).populate({path: 'projects'}) //populates all the project data in User's projects
            .then(result => result.projects) //returns just the projects
            .catch(err=> err); 
    },

    getOneById: function(projectId){ //get project by projectId
        return db.Project.findById({_id: projectId})
            .populate([{path: "sprints", populate: {path: "tasks", populate: {path: "assignee"}}}, {path: "owners"}, {path: "contributors"}])
            .then(result => result)
            .catch(err => err);
    },

    create: function(project){ //create a project using req.body
        return db.Project.create(project)
            .then(result => { //after creating the project
                result.owners.map(owner => { //for all owners is owners
                    return assignProjectToUser(owner, result._id); //assign project to user
                });
                result.contributors.map(contributor => { //for all contributors in contributors
                    return assignProjectToUser(contributor, result._id); //assign project to user
                });
                return result; //return the project created
            })
    },
    
    updateOneById: function(projectId, project){ //update a project by req.params.projectId using req.body
        return db.Project
            .findByIdAndUpdate(
                projectId, 
                project,
                {new: true, useFindAndModify: false}
            )
            .then(results => results)
            .catch(err => err);
    },
    
    deleteOneById: function(projectId){ //delete a project by req.params.projectId
        return db.Project
            .findById({ _id: projectId})//.populate({path: "sprints", populate: {path: "tasks"}}) //populates all the sprint data in Project's sprints
            .then(results => {
                results.owners.map(owner => removeProjectFromUser(owner, projectId)); //removing the project from owners
                results.contributors.map(contributor => removeProjectFromUser(contributor, projectId)); //removing the project from contributors
                return results.remove(); //removing the project (and cascade)
            })
            .catch(err => err);
    },

    addUser: function(parameters, userType){
        return assignUserToProject(parameters, userType)
        .then(result1 => {
            if(result1 == "Success") {
                return assignProjectToUser(parameters.userId, parameters.projectId)
                .then(result2 => result2);        
            } else {
                return result1;
            }
        }); 
        
    },

    removeUser: function(parameters, userType){
        return removeUserFromProject(parameters, userType)
        .then(result1 => {
            if(result1 == "Success") {
                return removeProjectFromUser(parameters.userId, parameters.projectId)
                .then(result2 => result2);
            } else {
                return result1;
            }
        });
    }
}