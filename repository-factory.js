/**
 * Repository factory for the rest system
 *
 * @module nag.rest.repository
 * @ngservice nagRestRepositoryFactory
 */
angular.module('nag.rest.repository', [
    'nag.rest.config',
    'nag.rest.schemaManager',
    'nag.rest.model'
  ])
  .factory('nagRestRepositoryFactory', [
    '$http',
    '$q',
    'nagRestSchemaManager',
    'nagRestConfig',
    'nagRestModelFactory',
    function ($http, $q, nagRestSchemaManager, nagRestConfig, nagRestModelFactory) {
      /**
       * All the internal properties are exposed through the mngr property.  This is done so not to pollute the top level properties and makes a clean distinction between built-in functionality and custom functionality.
       *
       * @class BaseRepository
       * @constructor
       *
       * @param resourceName
       * @param overrideSchemaOptions
       */
      var BaseRepository = function (resourceName, overrideSchemaOptions) {
        var self, schema, forceIsArray;
        self = this;
        forceIsArray = null;
        schema = nagRestSchemaManager.get(resourceName, overrideSchemaOptions);

        this.mngr = {};
        Object.defineProperties(this.mngr, {
          /**
           * The schema configured for this repository
           *
           * @property mngr.schema
           * @readonly
           * @type object
           */
          schema      : {
            value: schema
          },
          /**
           * Resource name for the repository
           *
           * @property mngr.resourceName
           * @readonly
           * @type string
           */
          resourceName: {
            value: resourceName
          },

          /**
           * Returns the relative route for the repository excluding the configured base url
           *
           * @method mngr.route
           *
           * @return {string} Repository's relative route
           *
           * @example:javascript
           * var userRepository = nagRestRepositoryFactory.create('user');
           *
           * //Returns
           * // /users
           * userRepository.route();
           */
          route: {
            get: function () {
              return schema.route;
            }
          },

          /**
           * Returns the full route for the repository including the configured base url
           *
           * @method mngr.fullRoute
           *
           * @return {string} Repository's full route
           *
           * @example:javascript
           * var userRepository = nagRestRepositoryFactory.create('user');
           *
           * //Returns
           * // /base/url/users
           * userRepository.fullRoute();
           */
          fullRoute: {
            get: function () {
              return nagRestConfig.getBaseUrl() + self.mngr.route
            }
          },

          /**
           * Create a new model based on this repository
           *
           * @method mngr.create
           *
           * @param {object} [initialData] Initial data to use to populate the model
           * @param {boolean} [remoteFlag=false] Whether to mark the model as synced to the remote service
           * @param {object} [overrideSchemaOptions] Override options for the schema for this instance of the model
           *
           * @return {object} New model instance
           *
           * @example:javascript
           * //using the repository is the recommended way to generate a new models, the first parameter is the
           * //initial data
           * var userRepository = nagRestRepositoryFactory.create('user');
           * var user = userRepository.mngr.create({
         *   firstName: 'John',
         *   lastName: 'Doe'
         * });
           *
           * //now by default it will create a model that has mngr.state set to 'new' so syncing it will make
           * //it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
           * //second parameter a value of true.  just note that you also have to make sure that the idProperty of
           * //initial data is also set otherwise is will still assume the model's mngr.state is 'new' even if
           * //the second parameter has a value of true
           * var remoteUser = userRepository.mngr.create({
         *   id: 123,
         *   firstName: 'John',
         *   lastName: 'Doe'
         * }, true);
           *
           * //the third parameter will allow you to create an instance of a model with a customized schema.  by
           * //default the model generated will use the schema associated to the repository but the third
           * //parameter is a list of overrides for the schema for the instance of that model
           * var customUser = userRepository.mngr.create({}, false, {
         *   route: '/custom/users'
         * });
           */
          create: {
            value: function (initialData, remoteFlag) {
              return new nagRestModelFactory(resourceName, initialData, remoteFlag, self.mngr.schema);
//          value: function(initialData, remoteFlag, overrideSchemaOptions) {
//            return nagRestModelFactory.create(resourceName, initialData, remoteFlag, overrideSchemaOptions);
            }
          },

          /**
           * Will assume the next request for retrieving data result will or will not be an array (based on passed value), will override schema.isArray
           *
           * @chainable
           *
           * @method mngr.forceIsArray
           *
           * @param {boolean} value Whether or not to for array mode
           *
           * @return {mngr}
           *
           * @example:javascript
           * //now when retrieving data, the library is smarter enough to guess whether the results will be returned
           * //as an array or a single object however sometimes the guess will be wrong.  any time you are retrieving
           * //data without an id, it assumes an array will be returned and when you have an id, it assume an object
           * //will be returned.  now lets say we have a rest api call with the route /session but it returns a
           * //single user object.  one way is to use the forceIsArray() method:

           * // get /session
           * var sessionRepository = nagRestRepositoryFactory.create('user', {
         *   '/session'
         * });
           * sessionRepository.mngr.forceIsArray(false).find();
           */
          forceIsArray: {
            value: function (value) {
              forceIsArray = value;
              return self.mngr;
            }
          },

          /**
           * Retrieve data through the REST service
           *
           * @method mngr.find
           *
           * @param {object} [params] Key/Value pairing of parameters to pass in the URL
           * @param {object} [headers] Key/Vlaue pairing of headers to pass along with the request
           * @param {object} [postData] Key/Value paring of data to pass in teh content of a POST
           *
           * @return {object|array} Either a model or an array or model, the object also has the promises .then method attach to access data that way
           *
           * @example:javascript
           * //one method that exists in order to retrieve data from a repository is the find() method.  The first
           * //parameter of find can take an object with key/value pairs that will be inserted into the query string
           * //part of the url.
           *
           * // GET /users?firstName=John
           * var users = userRepository.mngr.find({
         *   firstName: 'John'
         * });
           *
           * //you can also pass a number/string as the first argument and it will assume that is the value of the
           * //idProperty for the data the repository represents.  in this case the result is initially a new empty
           * //model and the data gets filled in once the data is received and processed
           *
           * // GET /users/123
           * var user = userRepository.mngr.find(123);
           *
           * //The second parameter of find() is an object of header/value pairs
           *
           * // GET /users with request header x-user:test
           * var users = userRepository.mngr.find({}, {
         *   'x-user': 'test'
         * });
           *
           * //now some rest apis offer the ability to do very complex queries however because of the complexity,
           * //they require you to pass the data in as a post request instead of get and that is what the third
           * //parameter is for.  If the third parameters is an object, it will send the request as a POST with
           * //the data of the third parameters as the content body
           *
           * // POST /users?query=data with content of
           * // {
         * //   "filters": [{
         * //     "field": "email",
         * //     "condition": "like",
         * //     "value": "%@gmail.com"
           * //   }]
           * // }
           * var gmailUsers = userRepository.mngr.find({
         *   query: 'data',
         * }, {}, true, {
         *   filters: [{
         *     field: 'email',
         *     condition: 'like',
         *     value: '%@gmail.com'
           *   }]
           * });
           */
          find: {
            value: function (params, headers, postData) {
              var getIsArray = function (value) {
                if (_.isBoolean(forceIsArray) || _.isBoolean(schema.isArray)) {
                  if (_.isBoolean(forceIsArray)) {
                    value = forceIsArray;
                    forceIsArray = null;
                  } else {
                    value = schema.isArray;
                  }
                }

                return value;
              };

              params = params || {};
              headers = headers || {};
              postData = postData || {};

              var isArray = schema.isArray !== null ? schema.isArray : true;
              var url = self.mngr.fullRoute;

              var httpConfig = {
                url   : url,
                method: 'GET'
              };

              if (_.isPlainObject(params) && !_.isEmpty(params)) {
                httpConfig.params = params;
              }

              if (!_.isEmpty(headers)) {
                httpConfig.headers = headers;
              }

              if (!_.isEmpty(postData)) {
                httpConfig.data = postData;
                httpConfig.method = 'POST';
              }

              if (_.isNumber(params) || _.isString(params)) {
                isArray = false;

                if (schema.flattenItemRoute === true) {
                  url = url.substr(url.lastIndexOf('/'));
                }

                httpConfig.url = url + '/' + params;

              }

              if (forceIsArray !== undefined) {
                isArray = forceIsArray;
                forceIsArray = undefined;
              }

              // isArray = getIsArray(isArray);
              // TODO watch is array

              var value = (isArray === true ? [] : self.mngr.create({}, false, schema));
              var deferred = $q.defer();
              value.then = deferred.promise.then;

              $http(httpConfig)
                .success(function (response) {

                  var data = {
                    rawResponse: response
                  };
                  var internalThen = value.then;

                  //this generic parsing should handle most cases for data parse but can be disabled if manually parsing is preferred/needed
                  if (schema.autoParse === true) {
                    data.parsedData = (isArray === true ? [] : null);
                    var dataLocation = (isArray === true ? schema.dataListLocation : schema.dataItemLocation);
                    var responseData = stringJsonParser(dataLocation, response);

                    //determine to parse as array or object
                    if (_(responseData).isArray()) {
                      for (var x = 0; x < responseData.length; x += 1) {
                        newObject = self.mngr.create(responseData[x], true, schema);

                        //push data for the deferred
                        data.parsedData.push(newObject);

                        //push data for the return value
                        value.push(newObject);
                      }
                    } else if (_(responseData).isObject()) {
                      var newObject = self.mngr.create(responseData, true, schema);

                      //set data for the deferred
                      data.parsedData = newObject;

                      //set data for the return value
                      value.mngr.extendData(responseData, true);
                      value.then = internalThen;
                    }
                  }

                  deferred.resolve(data);
                })
                .error(function (response) {
                  deferred.reject(response);
                });

              return value;
            }
          }
        });
        return this.mngr;
      };


      return BaseRepository;
//            /**
//             * Repository factory
//             *
//             * @ngservice nagRestRepositoryFactory
//             */
//            return {
//                /**
//                 * Create an instance of the repository factory
//                 *
//                 * @method create
//                 *
//                 * @param {string} resourceName Schema you want to use as th default for the repository factory
//                 * @param {object} overrideSchemaOptions Override option for the schema for use for this instance of the repository factory
//                 *
//                 * @returns {object} Instance of the repository factory
//                 */
//                create: function (resourceName, overrideSchemaOptions) {
//                    return new BaseRepository(resourceName, overrideSchemaOptions);
//                }
//            }
    }
  ]);
