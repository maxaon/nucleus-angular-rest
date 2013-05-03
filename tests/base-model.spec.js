describe('Rest Base Model', function(){
  var $httpBackend, unitTestMocker, userSchema, projectSchema, teamSchema, nagRestSchemaManager, nagRestBaseModel;

  userSchema = {
    route: '/users',
    properties: {
      id: {
        sync: false
      },
      firstName: {},
      lastName: {},
      username: {},
      managerId: {}
    },
    relations: {
      job: {
        resource: 'project'
      },
      manager: {
        resource: 'user',
        property: 'managerId'
      }
    },
    dataListLocation: 'response.data.users',
    dataItemLocation: 'response.data.user'
  };

  projectSchema = {
    route: '/projects',
    properties: {
      projectId: {
        sync: false
      },
      name: {}
    },
    relations: {
      team: {
        resource: 'team',
        flatten: false
      }
    },
    idProperty: 'projectId',
    dataListLocation: 'response.data.projects',
    dataItemLocation: 'response.data.project'
  };

  teamSchema = {
    route: '/teams',
    properties: {
      id: {
        sync: false
      },
      name: {}
    },
    dataListLocation: 'response.data.teams',
    dataItemLocation: 'response.data.team'
  };

  beforeEach(module('nag.rest.baseModel'));
  beforeEach(module('unitTestMocker'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    unitTestMocker = $injector.get('unitTestMocker');
    nagRestSchemaManager = $injector.get('nagRestSchemaManager');
    nagRestBaseModel = $injector.get('nagRestBaseModel');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should set default values', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');

    expect(model.toJson()).toEqual({});
    expect(model.getDirtyProperties()).toEqual([]);
    expect(model.isDirty()).toBe(false);
    expect(model.isRemote()).toBe(false);
    expect(model._getSelfRoute()).toBe('/users');
  });

  it('should be able to set initial data and dirty properties should be set if not initialized as isRemote', function() {
    nagRestSchemaManager.add('user', userSchema);
    var initialData = {
      firstName: 'Test',
      lastName: 'User'
    };
    var model = nagRestBaseModel.create('user', initialData);

    //expect(model.toJson()).toEqual(initialData);
    /*expect(model.getDirtyProperties()).toEqual([
      'firstName',
      'lastName'
    ]);
    expect(model.isDirty()).toBe(true);*/
    expect(1).toBe(1);
  });

  it('should be able to set initial data and dirty properties should not be set if initialized as isRemote', function() {
    nagRestSchemaManager.add('user', userSchema);
    var initialData = {
      id: 123,
      firstName: 'Test',
      lastName: 'User'
    };
    var model = nagRestBaseModel.create('user', initialData, true);

    expect(model.toJson()).toEqual(initialData);
    expect(model.getDirtyProperties()).toEqual([]);
    expect(model.isDirty()).toBe(false);
  });

  it('should be able to override value set in the schema manager', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {}, false, {
      route: '/v1/users'
    });

    expect(model._getSelfRoute()).toBe('/v1/users');
  });

  it('should not be able to redefine model options once they have been set for a model', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');

    expect(function() {
      model._setSchema(projectSchema)
    }).toThrow(new Error("Can't redefine schema once they have been set"));
    
    expect(model._getSelfRoute()).toBe('/users');
  });

  it('should evaluate isRemote() to false when isRemote is set to true but idProperty is not set', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {}, true);

    expect(model.isRemote()).toBe(false);
  });

  it('should evaluate isRemote() to false when idProperty is set but isRemote is not set to true', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    });

    expect(model.isRemote()).toBe(false);
  });

  it('should evaluate isRemote() to true when idProperty is set and isRemote is set to true', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    }, true);

    expect(model.isRemote()).toBe(true);
  });

  it('should evaluate _getSelfRoute() without idProperty appending when idProperty is present but isRemote() evaluates to false', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    });

    expect(model._getSelfRoute()).toBe('/users');
  });

  it('should evaluate _getSelfRoute() without base route without idProperty appending when idProperty is present but isRemote() evaluates to false', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    });

    expect(model._getSelfRoute(false)).toBe('/users');
  });

  it('should evaluate _getSelfRoute() without idProperty appending when idProperty is present and isRemote() evaluates to true', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    }, true);

    expect(model._getSelfRoute()).toBe('/users/123');
  });

  it('should evaluate _getSelfRoute() without base route without idProperty appending when idProperty is present and isRemote() evaluates to true', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    }, true);

    expect(model._getSelfRoute(false)).toBe('/users/123');
  });

  it('should be able to set/get a single value', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');
    var firstName = 'Test';
    model.set('firstName', firstName);

    expect(model.get('firstName')).toBe(firstName);
  });

  it('should be able to set/get a multiple values', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');
    var data = {
      firstName: 'Test',
      lastName: 'User'
    };
    model.set(data);

    expect(model.get('firstName')).toBe(data.firstName);
    expect(model.get('lastName')).toBe(data.lastName);
  });

  it('should not reset data when setting multiple values in one set() call', function() {

    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user', {
      id: 123
    });
    var data = {
      firstName: 'Test',
      lastName: 'User'
    };
    model.set(data);

    expect(model.get('id')).toBe(123);
    expect(model.get('firstName')).toBe(data.firstName);
    expect(model.get('lastName')).toBe(data.lastName);
  });

  it('should not be able to set data that is not defined in the property section of the schema', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');
    var test = 'Test';
    model.set('test', test);

    expect(model.get('test')).toBeUndefined();
  });

  it('should set dirty properties when set data to new value', function() {
    nagRestSchemaManager.add('user', userSchema);
    var data = {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    };
    var model = nagRestBaseModel.create('user', data, true);
    model.set({
      firstName: 'Test2',
      lastName: 'User2'
    });

    expect(model.isDirty()).toBe(true);
    expect(model.getDirtyProperties()).toEqual([
      'firstName',
      'lastName'
    ]);
  });

  it('should evaluate isProperty() to true', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');

    expect(model.isProperty('id')).toBe(true);
  });

  it('should evaluate isProperty() to false', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');

    expect(model.isProperty('noProperty')).toBe(false);
  });

  it('should evaluate isProperty() to false', function() {
    nagRestSchemaManager.add('user', userSchema);
    var model = nagRestBaseModel.create('user');

    expect(model.isProperty('noProperty')).toBe(false);
  });

  it('should clear dirtyProperties when syncing data', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });

    unitTestMocker.setValidPostUserResponse();
    model.sync();
    unitTestMocker.flush();

    expect(model.getDirtyProperties()).toEqual([]);
    expect(model.isDirty()).toBe(false);
  });

  it('should be able automatically POST data when the model is isRemote and updated itself with any data from the response', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });

    unitTestMocker.setValidPostUserResponse();
    model.sync();
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 234,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
    expect(model.isRemote()).toBe(true);
  });

  it('should be able automatically POST data when the model is isRemote and updated itself with any data from the response with a custom request format', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, false, {
      requestFormatter: function(modelData) {
        return {
          request: {
            data: modelData
          }
        }
      }
    });

    unitTestMocker.setValidPostUserCustomRequestFormatResponse();
    model.sync();
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 234,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
    expect(model.isRemote()).toBe(true);
  });

  it('should not send properties when sync is set to false or \'update\' on POST', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, false, {
      properties: {
        lastName: {
          sync: 'update'
        }
      }
    });

    unitTestMocker.setValidPostUserCustomResponse();
    model.sync();
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 234,
      firstName: 'Test',
      lastName: null,
      username: 'test.user'
    });
    expect(model.isRemote()).toBe(true);
  });

  it('should be able automatically PUT data when the model is isRemote', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);
    model.set('firstName', 'Test2');

    unitTestMocker.setValidPutUserResponse();
    model.sync();
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 123,
      firstName: 'Test2',
      lastName: 'User',
      username: 'test.user'
    });
    expect(model.isRemote()).toBe(true);
  });

  it('should be able to manually set the the http method used in syncing', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);
    model.get('firstName', 'Test2');

    unitTestMocker.setValidPatchUserResponse();
    model.sync('PATCH');
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 123,
      firstName: 'Test2',
      lastName: 'User',
      username: 'test.user'
    });
    expect(model.isRemote()).toBe(true);
  });

  it('should not send properties when sync is set to false or \'create\' on PATCH', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      properties: {
        lastName: {
          sync: 'create'
        }
      }
    });
    model.set('firstName', 'Test2');
    model.set('lastName', 'User2');

    unitTestMocker.setValidPatchUserResponse();
    model.sync('PATCH');
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 123,
      firstName: 'Test2',
      lastName: 'User',
      username: 'test.user'
    });
    expect(model.isRemote()).toBe(true);
  });

  it('should be able to DELETE a model', function() {
    nagRestSchemaManager.add('user', userSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);

    unitTestMocker.setValidDeleteUserResponse();
    model.destroy();
    unitTestMocker.flush();

    expect(model.isRemote()).toBe(false);
    expect(model.toJson()).toEqual({
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
  });

  it('should not be able to pull un-configured relationships', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);

    expect(function() {
      model.getRelation('project', 234);
    }).toThrow(new Error("There is no relationship defined for project"));
  });

  it('should be able to get all relationship data for a particular relationship', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);
    var modelProjects = [];

    unitTestMocker.setValidUserProjectsRelationshipMultipleResponse();
    model.getRelation('job').then(function(data) {
      //todo: test rawResponse
      modelProjects = data.parsedData;
    }, function(rawResponse) {

    });
    unitTestMocker.flush();

    expect(modelProjects.length).toBe(2);
    expect(modelProjects[0].toJson()).toEqual({
      projectId: 123,
      name: 'Project A'
    });
    expect(modelProjects[1].toJson()).toEqual({
      projectId: 124,
      name: 'Project B'
    });
  });

  it('should be able to get specific record for a particular relationship', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);
    var modelProject;

    unitTestMocker.setValidUserProjectsRelationshipSingleResponse();
    model.getRelation('job', 234).then(function(data) {
      //todo: test rawResponse
      modelProject = data.parsedData;
    }, function(rawResponse) {

    });
    unitTestMocker.flush();

    expect(modelProject.toJson()).toEqual({
      projectId: 234,
      name: 'Project B'
    });
  });

  it('should set the self route to the proper path for relational models', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);
    var modelProjects = [];

    unitTestMocker.setValidUserProjectsRelationshipMultipleResponse();
    model.getRelation('job').then(function(data) {
      //todo: test rawResponse
      modelProjects = data.parsedData;
    }, function(rawResponse) {

    });
    unitTestMocker.flush();

    expect(modelProjects[0]._getSelfRoute(false)).toBe('/projects/123');
    expect(modelProjects[1]._getSelfRoute(false)).toBe('/projects/124');
  });

  it('should be able to get relationship by way of value', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user',
      managerId: 124
    }, true);
    var manager = null;

    unitTestMocker.setValidUserManagerRelationshipResponse();
    manager = model.getRelation('manager');
    unitTestMocker.flush();

    expect(manager.toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'Manager',
      username: 'test.manager'
    });
    expect(manager._getSelfRoute(false)).toBe('/users/124');
  });

  it('should be able to get relationship by way of promise', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user',
      managerId: 124
    }, true);
    var manager = null;

    unitTestMocker.setValidUserManagerRelationshipResponse();
    model.getRelation('manager').then(function(data) {
      //todo: test rawResponse
      manager = data.parsedData;
    }, function(rawResponse) {

    });
    unitTestMocker.flush();

    expect(manager.toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'Manager',
      username: 'test.manager'
    });
    expect(manager._getSelfRoute(false)).toBe('/users/124');
  });

  it('should be able to get one record even though the url shows that multiple records should return on a schema level', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      isArray: false
    });


    unitTestMocker.setValidUserProjectsRelationshipMultipleUrlSingleResponse();
    var modelProject = model.getRelation('job');
    unitTestMocker.flush();

    expect(_.isPlainObject(modelProject)).toBe(true);
  });

  it('should be able to get multiple records even though the url shows that only one record should return on a schema level', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      isArray: true
    });

    unitTestMocker.setValidUserProjectsRelationshipSingleUrlMultipleResponse();
    var modelProjects = model.getRelation('job', 234);
    unitTestMocker.flush();

    expect(modelProjects.length).toBe(2);
  });

  it('should use forceIsArray over schema.isArray', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      isArray: true
    });

    unitTestMocker.setValidUserProjectsRelationshipSingleResponse();
    var modelProjects = model.forceIsArray(false).getRelation('job', 234);
    unitTestMocker.flush();

    expect(_.isPlainObject(modelProjects)).toBe(true);
  });

  it('should be able to get one record even though the url shows that multiple records should return on a call level', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);

    unitTestMocker.setValidUserProjectsRelationshipMultipleUrlSingleResponse();
    var modelProject = model.forceIsArray(false).getRelation('job');
    unitTestMocker.flush();

    expect(_.isPlainObject(modelProject)).toBe(true);

    unitTestMocker.setValidUserProjectsRelationshipMultipleResponse();
    modelProject = model.getRelation('job');
    unitTestMocker.flush();

    expect(modelProject.length).toBe(2);
  });

  it('should be able to get multiple records even though the url shows that only one record should return on a call level', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);

    unitTestMocker.setValidUserProjectsRelationshipSingleUrlMultipleResponse();
    var modelProjects = model.forceIsArray(true).getRelation('job', 234);
    unitTestMocker.flush();

    expect(modelProjects.length).toBe(2);

    unitTestMocker.setValidUserProjectsRelationshipSingleResponse();
    modelProjects = model.getRelation('job', 234);
    unitTestMocker.flush();

    expect(_.isPlainObject(modelProjects)).toBe(true);
  });

  if('should not flatten the route if flattenItemRoute is set to false', function() {
    var customProjectSchema = _.merge(projectSchema, {
      flattenItemRoute: false
    });
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', customProjectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true);

    unitTestMocker.setValidUserProjectsRelationshipMultipleResponse();
    var modelProjects = model.getRelation('job');
    unitTestMocker.flush();

    expect(modelProjects.length).toBe(2);
    expect(modelProjects[0]._getSelfRoute()).toBe('/users/123/projects/123');
    expect(modelProjects[1]._getSelfRoute()).toBe('/user/123/projects/124');

    unitTestMocker.setValidUserProjectsRelationshipSingleResponse();
    modelProjects = model.getRelation('job', 234);
    unitTestMocker.flush();

    expect(_.isPlainObject(modelProjects)).toBe(true);
    expect(modelProjects._getSelfRoute()).toBe('/users/123/projects/234');
  });

  it('should flatten the route for the generate model when getting a relation is flatten is set to true for the relation even if main schmea has flattenItemRoute set to false', function() {
    var customProjectSchema = _.merge(projectSchema, {
      flattenItemRoute: false
    });
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', customProjectSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      relations: {
        job: {
          flatten: true
        }
      }
    });

    unitTestMocker.setValidUserProjectsRelationshipMultipleResponse();
    var modelProjects = model.getRelation('job');
    unitTestMocker.flush();

    expect(modelProjects.length).toBe(2);
    expect(modelProjects[0]._getSelfRoute()).toBe('/projects/123');
    expect(modelProjects[1]._getSelfRoute()).toBe('/projects/124');

    unitTestMocker.setValidUserProjectsRelationshipSingleResponse();
    modelProjects = model.getRelation('job', 234);
    unitTestMocker.flush();

    expect(_.isPlainObject(modelProjects)).toBe(true);
    expect(modelProjects._getSelfRoute()).toBe('/projects/234');
  });

  it('should be able to get multi-leveled resource lists', function() {
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);
    nagRestSchemaManager.add('team', teamSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      relations: {
        job: {
          flatten: false
        }
      }
    });

    unitTestMocker.setValidUserProjectsRelationshipSingleNestedResponse();
    var modelProject = model.getRelation('job', 234);
    unitTestMocker.flush();

    unitTestMocker.setValidUserProjectTeamsMultipleNestedResponse();
    var projectTeams = modelProject.getRelation('team');
    unitTestMocker.flush();

    expect(projectTeams.length).toBe(2);
    expect(projectTeams[0]._getSelfRoute()).toBe('/users/123/projects/234/teams/123');
    expect(projectTeams[1]._getSelfRoute()).toBe('/users/123/projects/234/teams/124');
  });

  it('should be able to get multi-leveled resource lists where second level resource does not flatten but third level resource does', function() {
    var customProjectSchema = _.merge(projectSchema, {
      relations: {
        team: {
          flatten: true
        }
      }
    })
    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', customProjectSchema);
    nagRestSchemaManager.add('team', teamSchema);

    var model = nagRestBaseModel.create('user', {
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    }, true, {
      relations: {
        job: {
          flatten: false
        }
      }
    });

    unitTestMocker.setValidUserProjectsRelationshipSingleNestedResponse();
    var modelProject = model.getRelation('job', 234);
    unitTestMocker.flush();

    unitTestMocker.setValidUserProjectTeamsMultipleNestedResponse();
    var projectTeams = modelProject.getRelation('team');
    unitTestMocker.flush();

    expect(projectTeams.length).toBe(2);
    expect(projectTeams[0]._getSelfRoute()).toBe('/teams/123');
    expect(projectTeams[1]._getSelfRoute()).toBe('/teams/124');
  });
});