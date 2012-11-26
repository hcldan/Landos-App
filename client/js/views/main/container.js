
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/main/main.html',
  'utils'
], function($, _, Backbone, mainContainerViewTemplate, utils){

  // The container for the initial page that every user sees when they open
  // the application.
  var MainContainerView = Backbone.View.extend({
    el: '#canvas',

    events: {
      "click #order_btn_nav" : function() {
        this.trigger("click:order");
      }
    },
                                               
    template: Hogan.compile(mainContainerViewTemplate),

    render: function(){
      var context = {
        "class" : utils.isRun() ? "success" : "error",
        "status" : utils.getStatus(),
        "isRun" : utils.isRun()
      }
      var rendered = this.template.render(context);
      this.$el.html(rendered);
    }
  });
  return MainContainerView;
});
