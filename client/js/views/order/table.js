
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/order/table.html',
  'views/order/item'
], function($, _, Backbone, orderTableTemplate, OrderItemView) {

  // Displays the contents of an order as a table.  
  var OrderTableView = Backbone.View.extend({
    tagName: "table",

    className: "table table-hover",
    
    template: Hogan.compile(orderTableTemplate),
                                                  
    initialize: function() {
      this.items = this.options;
    },
    
    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);

      this.items.each(function(orderItem) {
        var orderItemView = new OrderItemView({"model" : orderItem});
        this.$el.append(orderItemView.render().el);
      }, this);
      return this;
    }
  });
  return OrderTableView;
});
