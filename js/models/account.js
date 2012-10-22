
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/orderlist',
  'utils'
], function($, _, Backbone, OrderList, utils) {

  var Account = Backbone.Model.extend({
    initialize: function() {
      this.orders = new OrderList;
      // The collection is properly reset only when all *items* are loaded
      this.orders.bind("items:reset", function() {
        this.trigger("items:reset");
      }, this);
    },

    update: function() {
      this.orders.fetch({ 
       "success" : this.orders.setItems, 
       "headers" : utils.getHeaders()
     });
    },

    total: function() {
      return this.orders.sum();
    }
  });
  return Account
});
