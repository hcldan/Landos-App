
define([
  'jquery',
  'underscore',
  'backbone',
  'models/order',
  'models/item'
], function($, _, Backbone, Order, Item) {

  var OrderList = Backbone.Collection.extend({
    model: Order,

    // Set the elements of the nested collection.
    // There may be a backbone function designed to handle this.
    // Consider changing in the future.
    setItems: function(self) {
      _.each(self.models, function(model) {
        model.set({"run_id": model.attributes.run_id});
        _.each(model.attributes.items, function(attr) {
          var item = new Item(attr);
          model.items.add(item);
        });
      });
      // If we rely on the 'reset' event triggered by the OrderList collection
      // to render orders, we will render before the underlying ItemList will be
      // populated. We need to wait until all items are returned from the server
      // before we can render. We use the custom 'items:reset' event to signify
      // when the ItemLists are populated and ready to render.
      self.trigger("items:reset");
    },

    initialize: function() {
      this.url = "/orders";
    },
  // TODO: Not implemented
  sum: function() {
    return 0;
  }
  });
  return OrderList;
});
