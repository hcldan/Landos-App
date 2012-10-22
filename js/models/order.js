
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/itemlist',
  'utils'
], function($, _, Backbone, ItemList, utils) {
  
  var Order = Backbone.Model.extend({
  initialize: function(options) {
    this.items = new ItemList;
    this.items.bind("reset", function() {this.trigger("items:reset");}, this);
  },

  total: function() {
    return this.items.sum();
  },

  add: function(item, callback) {
    this.items.create(item, {
      "wait" : true,
      "success": callback,
      "error" : this.error,
      "headers" : utils.getHeaders()
    });
  },

  error: function(model, response) {
    this.view.trigger("order:error", "There was an error");
  },

  remove: function(item) {
    item.destroy();
  }
});
  
  return Order;
});
