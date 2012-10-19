
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/grid.html'
], function($, _, Backbone, orderGridTemplate) {
  
  var OrderGridView = Backbone.View.extend({
    tagName: "div",
  
    template: Hogan.compile(orderFormTemplate),
                                                  
    initialize: function() {
    },
    
    render: function() {
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
      return this;
    }
});
  
  return OrderGridView;
});
