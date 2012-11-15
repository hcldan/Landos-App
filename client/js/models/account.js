
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
      // The collection is properly reset only when all *items* are loaded.
      // If we rely on the reset event triggered by the OrderList, we will only 
      // have a list of orders. The items that are part of each order are 
      // retrieved asynchronously. We know that all orders have their constiuent items
      // when we recieve the custom 'items:reset' event.
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

    // TODO: Remove. This method is not used.
    total: function() {
      return this.orders.sum();
    }
  });
  return Account
});
