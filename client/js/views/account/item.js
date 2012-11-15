
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/account/item.html'
], function($, _, Backbone, accountItemViewTemplate) {

  // The AccountItemView displays a view for a single item.
  var AccountItemView = Backbone.View.extend({
    tagName: "dl",

    template: Hogan.compile(accountItemViewTemplate),

    // Delegate attaching this element to the DOM to the parent view.
    render: function() {
      this.$el.html(this.template.render(this.model.toJSON()));
      return this;
    }
  });
  
  return AccountItemView;
});
