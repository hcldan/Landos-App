
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/order.html',
  'views/order/form',
  'views/order/grid',
  'models/item',
  'models/order'
], function($, _, Backbone, orderContainerViewTemplate, OrderFormView, 
            OrderGridView, Item, Order) {
  
  var OrderContainerView = Backbone.View.extend({
    el: "#canvas",
                                                  
    setName: function() {
      debugger;
    },
                                                  
    template: Hogan.compile(orderContainerViewTemplate),
                                                  
    initialize: function() {
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
      
      this.orderFormView = new OrderFormView({"model": new Item});
      this.orderGridView = new OrderGridView({"model": new Order});
      
      // Render subviews
      this.orderFormView.render();
      var grid = this.orderGridView.render().el;
      
      // Attach subviews to DOM
      //$("#order_form").html(form);
      $("#order_grid").html(grid);
    }
});
  
  return OrderContainerView;
});
