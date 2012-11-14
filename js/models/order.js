
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/itemlist',
  'utils'
], function($, _, Backbone, ItemList, utils) {
  
  // The model for an order. Composed of a list of Item models.
  var Order = Backbone.Model.extend({
  initialize: function(options) {
    this.items = new ItemList;
    this.items.bind("reset", function() {this.trigger("items:reset");}, this);
  },

  // Return the total price of all items in the order.
  total: function() {
    return this.items.sum();
  },

  // Add an item to the order.
  // Stores the Item locally and on the server.
  add: function(item, callback) {
    this.items.create(item, {
      "wait" : true,
      "success": callback,
      "error" : this.error,
      "headers" : utils.getHeaders()
    });
  },

  // Trigger an error event if there is a problem adding an item to an order.
  error: function(model, response) {
    this.view.trigger("order:error", response);
  },

  // Removes an Item locally and on the server.
  remove: function(item) {
    item.destroy();
  }
});
  
  return Order;
});
