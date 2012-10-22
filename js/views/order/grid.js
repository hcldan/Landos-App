
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/grid.html',
  'views/order/table',
  'utils'
], function($, _, Backbone, orderGridTemplate, OrderTableView, utils) {
  
  var OrderGridView = Backbone.View.extend({
    el: "#order_grid",
    
    template: Hogan.compile(orderGridTemplate),
                                                  
    initialize: function() {
      var success = _.bind(function() {
          this.orderTableView = new OrderTableView(this.model.items);
          this.model.items.bind("destroy", this.render, this);
          //this.model.items.bind("reset", this.render, this);
          this.render();
        }, this);
      this.model.view = this;
      this.model.items.fetch({
        "headers" : utils.getHeaders(),
        "success" : success
      });
    },
    
    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);

      if (this.model.items.length === 0 || !this.orderTableView) {
        $("#order_info").show();
      } else {
        $("#order_info").hide();
        $("#order-table").replaceWith(this.orderTableView.render().el);
        $("#total").text(" " + this.model.total());
      }
      return this;
    }
});
  return OrderGridView;
});
