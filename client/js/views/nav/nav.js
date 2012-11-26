
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/nav/nav.html',
  'utils'
], function($, _, Backbone, NavTemplate, utils){

  var NavView = Backbone.View.extend({
    
    el: "#main-nav-list",
  
    template: Hogan.compile(NavTemplate),

    render: function() {

      var context = {
        "items" : []
      };

      if (utils.isRun()) {
        context.items.push({"item" : "order", "displayName" : "Order"});
      }

      context.items.push({"item" : "menu", "displayName" : "Menu"});
      context.items.push({"item" : "account", "displayName" : "Account"});
      
      if (utils.isAdmin()) {
        context.items.push({"item" : "dashboard", "displayName" : "Dashboard"});
      }

      this.$el.html(this.template.render(context));
    }
});
  
  return NavView;
});