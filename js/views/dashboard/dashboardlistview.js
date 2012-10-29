
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/dashboard/listview.html'
], function($, _, Backbone, dashboardListViewTemplate) {
  
  var DashboardListView = Backbone.View.extend({
    el: "#dashboard_canvas",
  
    template: Hogan.compile(dashboardListViewTemplate),
    
    initialize: function() {
      this.orders = new OrderList;
      this.orders.url = "/orders/all";
      this.orders.fetch({"beforeSend" : addAuth, 
                         "success" : this.orders.setItems, 
                         "headers" : headers()});
    },

    render: function() {
      /*
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
       */
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
    }
});
  
  return DashboardListView;
});
