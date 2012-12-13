
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/dashboard/listview.html',
  'collections/orderlist',
  'utils'
], function($, _, Backbone, dashboardListViewTemplate, OrderList, utils) {
  
  var DashboardListView = Backbone.View.extend({
    el: "#dashboard_canvas",
  
    template: Hogan.compile(dashboardListViewTemplate),
    
    initialize: function() {
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

    render: function() {
       var context = this.orders.toJSON();
       for (var i = 0; i < context.length; i++) {
       var order = context[i];
       for (var j = 0; j < order.items.length; j++) {
       var item = order.items[j];
       item.commentsSection = item.comments ? [{"comments" : item.comments}] : [];
       }
       }
       var rendered = this.template.render({"orders" : this.orders.toJSON()});
       this.$el.html(rendered);
    }
});
  
  return DashboardListView;
});