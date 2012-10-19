
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/itemlist'
], function($, _, Backbone, ItemList) {
  
  var Order = Backbone.Model.extend({
  initialize: function(options) {
    this.items = new ItemList;
  },

  total: function() {
    return this.items.sum();
  },

  add: function(item, callback) {
    this.items.create(item, {"wait" : true,
                             "success": callback,
                             "error" : this.error,
                             "headers" : headers(),
                             "beforeSend" : addAuth});
  },

  error: function(model, response) {

  },

  remove: function(item) {
    item.destroy();
  }
});
  
  return Order;
});
