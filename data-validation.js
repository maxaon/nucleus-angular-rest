angular.module('nag.dataValidation', [])
.provider('nagDataValidation', function() {
  var validators = {
    email: function(value){
      var regex = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
      return regex.test(value);
    },

    notEmpty: function(value){
      var test = value;
      return (test != 0 && test != undefined);
    },

    min: function(value, minValue){
      var value = parseInt(value)
      return (!_(value).isNaN() && value >= minValue);
    },

    max: function(value, maxValue){
      var value = parseInt(value)
      return (!_(value).isNaN() && value <= maxValue);
    },

    range: function(value, minValue, maxValue){
      var value = parseInt(value)
      return (!_(value).isNaN() && value >= minValue && value <= maxValue);
    },

    match: function(value1, value2){
      return _(value1).isEqual(value2);
    },

    custom: function(callback) {
      var callbackParameters = Array.prototype.slice.call(arguments, 1);
      return callback.apply(null, callbackParameters);
    }
  };

  return {
    $get: function() {
      return {
        /**
         * Validate data.
         *
         * Additional parameters after validation type are the parameters required for the validation type
         *
         * @param validationType
         */
        validate: function(validationType) {
          var validatorParameters = Array.prototype.slice.call(arguments, 1);
          return validators[validationType].apply(null, validatorParameters);
        }
      };
    },
    add: function(name, callback) {
      validators[name] = callback;
    }
  };
});
