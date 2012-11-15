
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/order/item.html'
], function($, _, Backbone, orderItemTemplate) {

  // Displays an item of an order in the order grid.  
  var OrderItemView = Backbone.View.extend({
    tagName: "tr",

    template: Hogan.compile(orderItemTemplate),

    events: {
      "click .icon-remove" : "remove"
    },

    remove: function(e) {
      this.model.destroy();
    },

    render: function() {
      this.$el.html(this.template.render(this.model.toJSON()));
      return this;
    }
  });
  return OrderItemView;
});
