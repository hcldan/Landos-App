
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/account/order.html'
], function($, _, Backbone, accountOrderTemplate) {

  var AccountOrderView = Backbone.View.extend({
    tagName: "div",

    "className": "row span8",

    template: Hogan.compile(accountOrderTemplate),

    render: function() {
      this.$el.html(this.template.render(this.model.toJSON()));
      return this;
    }
  });
  
  return AccountOrderView;
});
