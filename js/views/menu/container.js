
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/menu/menu.html'
], function($, _, Backbone, menuContainerViewTemplate) {
  
  var MenuContainerView = Backbone.View.extend({
    el: "#canvas",
  
    template: Hogan.compile(menuContainerViewTemplate),
                                                  
    initialize: function() {
    },

    render: function() {
    
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
    }
});
  
  return MenuContainerView;
});
