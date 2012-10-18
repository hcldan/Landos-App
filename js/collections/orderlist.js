
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
  },

  initialize: function() {
    this.url = "/orders";
    //this.fetch({"beforeSend" : addAuth, "success" : this.setItems});
  },

  sum: function() {
  }
});
