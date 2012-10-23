
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/account/history.html',
  'views/account/order',
  'views/account/item'
], function($, _, Backbone, accountHistoryViewTemplate, AccountOrderView, AccountItemView) {
  
  var AccountHistoryView = Backbone.View.extend({
    el: "#account_history",

    initialize: function() {
      this.model.view = this;
      this.model.bind("loaded", this.render, this);
      this.model.bind("items:reset", this.render, this);
    },

    update: function() {
      this.model.update();
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

      if (this.model.orders.length === 0) {
        this.$el.html("<h3>There were no orders to display.</h3>");
      }

      $("#account_total").text(" " + this.model.total());
      return this;
    }
  });
  
  return AccountHistoryView;
});
