
var DashboardTableView = Backbone.View.extend({
  el: "#orderTable",

  events: {
    "click .paid" : "handlePaid"
  },

  template: Hogan.compile($.trim($("#dashboardTable_tmpl").text())),

  initialize: function() {
    // this should probably use the dashboard model
    this.orders = new OrderList;
    this.orders.url = "/orders/all";
    this.orders.fetch({"beforeSend" : addAuth, "success" : this.orders.setItems, "headers" : headers()});
  },

  handlePaid: function(e) {
    
  },

render: function() {
    debugger;
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
