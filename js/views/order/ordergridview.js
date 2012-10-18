
var OrderGridView = Backbone.View.extend({
  el: "#order_list",

  events: {
  },

  initialize: function() {
    this.model.view = this;
    this.model.items.fetch({"beforeSend" : addAuth, "headers" : headers()});
    this.model.items.bind("destroy", this.render, this);
    this.model.items.bind("reset", this.render, this);
  },

  render: function() {
    var self = this;

    if (this.model.items.length > 0) {
      $("#order_info").hide();
    } else {
      $("#order_info").show();
    }

    $("#order_list > tbody > tr").remove();

    this.model.items.each(function(orderItem) {
      var orderItemView = new OrderItemView({"model" : orderItem});
      self.$el.append(orderItemView.render().el);
    });

    $("#total").text(" " + this.model.total());
    return this;
  }
});
