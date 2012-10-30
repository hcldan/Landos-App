
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/dashboard/table.html',
  'collections/orderlist',
  'utils'
], function($, _, Backbone, dashboardTableTemplate, OrderList, utils) {
  
var DashboardTableView = Backbone.View.extend({
  el: "#dashboard_canvas",

  events: {
    "click .paid" : "handlePaid"
  },

  template: Hogan.compile(dashboardTableTemplate),

  initialize: function() {
    // this should probably use the dashboard model
    var success = _.bind(function() {
        this.orders.setItems
        this.render();
      }, this);

    this.orders = new OrderList;
    this.orders.url = "/orders/all";
    this.orders.fetch({
      "headers" : utils.getHeaders(),
      "success" : success
    });

  },

  handlePaid: function(e) {
    
  },

render: function() {
    var context = this.orders.toJSON();
    for (var i = 0; i < context.length; i++) {
      var order = context[i];
      for (var j = 0; j < order.items.length; j++) {
        var item = order.items[j];
        item.commentsSection = item.comments ? [{"comments" : item.comments}] : [];
      }
    }
    var date = new Date();
    var rendered = this.template.render({"orders" : context, "date" : date.toDateString()});
    this.$el.html(rendered);
  }
});  
  
  return DashboardTableView;
});