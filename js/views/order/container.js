
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
    },

    itemAdded: function(item) {
      var callback = _.bind(function() {
        this.orderGridView.render();
        this.orderFormView.reset();
      }, this);
      this.orderGridView.model.add(item, callback);
    },

    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);
      
      this.orderFormView = new OrderFormView({"model": new Item});
      this.orderGridView = new OrderGridView({"model": new Order});
      this.orderFormView.bind("itemAdded", this.itemAdded, this);
      
      // Render subviews
      this.orderFormView.render();
      this.orderGridView.render();
      //var grid = this.orderGridView.render().el;
      
      // Attach subviews to DOM
      //$("#order_form").html(form);
      //$("#order_grid").html(grid);
    }
});
  
  return OrderContainerView;
});
