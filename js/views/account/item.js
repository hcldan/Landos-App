
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/account/item.html'
], function($, _, Backbone, accountItemViewTemplate) {

  var AccountItemView = Backbone.View.extend({
    tagName: "dl",

    template: Hogan.compile(accountItemViewTemplate),

    render: function() {
      this.$el.html(this.template.render(this.model.toJSON()));
      return this;
    }
  });
  
  return AccountItemView;
});
