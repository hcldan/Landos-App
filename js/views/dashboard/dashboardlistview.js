
var DashboardListView = Backbone.View.extend({
  el: "#orders",

  template: Hogan.compile($.trim($("#dashboardItems_tmpl").text())),

  initialize: function() {
    this.orders = new OrderList;
    this.orders.url = "/orders/all";
    this.orders.fetch({"beforeSend" : addAuth, "success" : this.orders.setItems, "headers" : headers()});
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
