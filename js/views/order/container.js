
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
                                                  
    template: Hogan.compile(orderContainerViewTemplate),

    itemAdded: function(item) {
      var callback = _.bind(function() {
        this.orderGridView.render();
        this.orderFormView.reset();
      }, this);
      this.orderGridView.model.add(item, callback);
    },

    showError: function(response) {
      var status = response.status;
      
      $("#info").addClass("alert");
      $("#info").addClass("alert-error");
      $("#info").html("<strong> Oops, there was a problem on our end.</strong>");
    },

    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);
      
      this.orderFormView = new OrderFormView({"model": new Item});
      this.orderGridView = new OrderGridView({"model": new Order});
      this.orderFormView.bind("itemAdded", this.itemAdded, this);
      this.orderGridView.bind("order:error", this.showError, this);
      
      // Render subviews
      this.orderFormView.render();
      this.orderGridView.render();
    }
});
  
  return OrderContainerView;
});
