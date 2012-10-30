
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/orderlist'
], function($, _, Backbone, OrderList) {
  
  var Dashboard = Backbone.Model.extend({
  initialize: function() {
    this.orders = new OrderList;
  },

  total: function() {
    return this.orders.sum();
  }
});
  
  return Dashboard;
});
