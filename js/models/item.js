
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  
  var Item = Backbone.Model.extend({

  defaults: {
    "quantity" : 1,
    "comments" : ""
  },

  initialize: function() {
    this.urlRoot = "/item";
  },

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

    // use underscore or hasOwnProperty
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

  // TODO: This may not be neccessary
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
