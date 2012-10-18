
var Account = Backbone.Model.extend({
  initialize: function() {
    this.orders = new OrderList;
    this.orders.fetch({"beforeSend" : addAuth, 
                       "success" : this.orders.setItems, 
                       "headers" : headers()});

  },

  total: function() {
    return this.orders.sum();
  }
});
