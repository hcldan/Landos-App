
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/main/main.html'
], function($, _, Backbone, mainContainerViewTemplate){
  
  var MainContainerView = Backbone.View.extend({
    el: $('#canvas'),
                                               
    template: Hogan.compile(mainContainerViewTemplate),
                                               
    render: function(){
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
    }
  });
  return MainContainerView;
});
