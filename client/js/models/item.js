
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {

  // Models a individual component of an order. Responsible for validating
  // user input and synchronizing data with the server.
  var Item = Backbone.Model.extend({

  // Default values for appropriate fields
  defaults: {
    "quantity" : 1,
    "comments" : ""
  },

  initialize: function() {
    this.urlRoot = "/item";
  },

  // Validates both components of the model and the validity of the model
  // itself. If the model has changed attributes, the assumption is that an
  // individual field is requesting validation. If the model does not have
  // changed attributes, the assumption is that the entire model is being
  // validated. There are cases where these assumptions are not true, but are
  // not worth investigating further.
  validate: function(attrs) {
    var changedAttributes = this.changedAttributes(attrs);
    var _validate = {
      "id" : function(v) { return true; },
      "name" : function(v) { return v && v.length > 0; },
      "size" : function(v) { return v && v.length > 0; },
      "price" : function(v) { return $.isNumeric(v); },
      "quantity" : function(v) { return $.isNumeric(v); },
      "comments" : function(v) { return true; }
    };

    // TODO: use underscore or hasOwnProperty.
    if (changedAttributes) {
      for (var attr in changedAttributes) {

          if (!_validate[attr](attrs[attr])) {

            return attr;
          }
      }
    } else {
        for (var attr in _validate) {
            if (!_validate[attr](attrs[attr])) {
              return attr;
            }
        }
    }
  },

  // TODO: Remove. This may not be neccessary
  toJSON: function() {
    return {
      "id" : this.attributes.id,
      "name" : this.attributes.name,
      "size" : this.attributes.size,
      "price" : this.attributes.price,
      "quantity" : this.attributes.quantity,
      "comments" : this.attributes.comments
    };
  }
});
  
  return Item;
});
