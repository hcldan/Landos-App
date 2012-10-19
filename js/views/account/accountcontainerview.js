
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/account/account.html'
], function($, _, Backbone, accountContainerViewTemplate) {
  
  var AccountContainerView = Backbone.View.extend({
    el: "#canvas",
  
    template: Hogan.compile(accountContainerViewTemplate),
                                                  
    initialize: function() {
      //this.ahv = new AccountHistoryView({"model": new Account});
    },

    render: function() {
      //this.ahv.render();
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
    }
});
  
  return AccountContainerView;
});
