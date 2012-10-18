
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/order.html'
], function($, _, Backbone, orderContainerView) {
  
  var OrderContainerView = Backbone.View.extend({
    el: "#canvas",
  
    template: Hogan.compile(orderContainerView),
                                                  
    initialize: function() {
      //this.ofv = new OrderFormView({"model": new Item});
      //this.ogv = new OrderGridView({"model": new Order});
      //this.ofv.bind("itemAdded", this.itemAdded, this);
    },

    itemAdded: function(item) {

      var cb = (function(self) {
        return function() {
          self.ogv.render();
          self.ofv.reset();
        };
      })(this);
      this.ogv.model.add(item, cb);
    },

    render: function() {
    
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
    
      //this.ofv.render();
      //this.ogv.render();
    }
});
  
  return OrderContainerView;
});
