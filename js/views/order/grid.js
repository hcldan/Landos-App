
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/grid.html'
], function($, _, Backbone, orderGridTemplate) {
  
  var OrderGridView = Backbone.View.extend({
    
    template: Hogan.compile(orderGridTemplate),
                                                  
    initialize: function() {
    },
    
    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);
      return this;
    }
});
  
  return OrderGridView;
});
