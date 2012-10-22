
define([
  'jquery',
  'underscore',
  'backbone',
  'models/order',
  'models/item'
], function($, _, Backbone, Order, Item) {

  var OrderList = Backbone.Collection.extend({
    model: Order,

    setItems: function(self) {
      _.each(self.models, function(model) {
        model.set({"run_id": model.attributes.run_id});
        _.each(model.attributes.items, function(attr) {
          var item = new Item(attr);
          model.items.add(item);
        });
      });
      self.trigger("items:reset");
    },

    initialize: function() {
      this.url = "/orders";
    },

  sum: function() {
    return 0;
  }
  });
  return OrderList;
});
