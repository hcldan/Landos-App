
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/form.html'
], function($, _, Backbone, orderFormTemplate) {
  
  var OrderFormView = Backbone.View.extend({
    tagName: "form",
  
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
  
  return OrderFormView;
});
