
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/orderlist',
  'utils'
], function($, _, Backbone, OrderList, utils) {
  // Models a user's order history.
  var Account = Backbone.Model.extend({
    initialize: function() {
      this.orders = new OrderList;
      // The collection is properly reset only when all *items* are loaded
      this.orders.bind("items:reset", function() {
        this.trigger("items:reset");
      }, this);
    },

    // Fetch orders from the server
    update: function() {
      this.orders.fetch({ 
       "success" : this.orders.setItems, 
       "headers" : utils.getHeaders()
     });
    },

    // TODO: remove
    total: function() {
      return this.orders.sum();
    }
  });
  return Account
});
