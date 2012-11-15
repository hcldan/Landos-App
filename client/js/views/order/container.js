
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/order/order.html',
  'views/order/form',
  'views/order/grid',
  'models/item',
  'models/order'
], function($, _, Backbone, orderContainerViewTemplate, OrderFormView, 
            OrderGridView, Item, Order) {

  // The main container for the order view.  
  var OrderContainerView = Backbone.View.extend({
    el: "#canvas",
                                                  
    template: Hogan.compile(orderContainerViewTemplate),

    // This function is bound to the OrderFormView and is called when an item
    // is added to an order. The function manages the hand-off of the Item
    // model from the OrderForm to the OrderGrid. The OrderGrid's model is
    // persisted to the backend service and handles the actual submission of the item.
    itemAdded: function(item) {
      var callback = _.bind(function() {
        this.orderGridView.render();
        this.orderFormView.reset();
      }, this);
      this.orderGridView.model.add(item, callback);
    },

    // Shows an error to the user whenever a request goes awry. This could be
    // handled a little more elegantly. There is not much granularity in terms
    // of presenting the error to the user. Any error that occurs on the
    // backend, regardless of class, will be reported as a general error. This
    // can be improved.
    showError: function(response) {
      var status = response.status;
      
      $("#info").addClass("alert");
      $("#info").addClass("alert-error");
      $("#info").html("<strong> Oops, there was a problem on our end.</strong>");
    },

    render: function() {
      // This must happen *before* the subviews are rendered. The subviews
      // depend on having the container DOM elements present in order to render.
      var rendered = this.template.render({});
      this.$el.html(rendered);
      
      // This must occur *after* the container template is rendered. Otherwise,
      // there will be no DOM elements to attach to.
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
