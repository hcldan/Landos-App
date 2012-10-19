
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/order/form/nameInput.html'
], function($, _, Backbone, nameInputViewTemplate) {
  
  var NameInputView = Backbone.View.extend({
    template: Hogan.compile(nameInputViewTemplate),
                                             
    initialize: function() {
    },
                                             
    render: function() {
      this.$el.typeahead(this.model.toJSON());
    },
                                             
    validate: function() {
    },
                                             
    preload: function() {
    }
  });
  
  return NameInputView;
});
