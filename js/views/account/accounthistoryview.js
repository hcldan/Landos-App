
var AccountHistoryView = Backbone.View.extend({
  el: "#account_history",

  initialize: function() {

    this.model.view = this;
    this.model.bind("loaded", this.render, this);
  },

  render: function() {
    var self = this;

    $("#account_history").children(".span8").remove();

    this.model.orders.each(function(order) {

      var accountOrderView = new AccountOrderView({"model" : order});
      self.$el.append(accountOrderView.render().el);
      order.items.each(function(item) {

        var accountItemView = new AccountItemView({"model" : item});
        self.$el.children().last().children(".order_contents").append(accountItemView.render().el);
      });
    });

    $("#account_total").text(" " + this.model.total());
    return this;
  }
});
