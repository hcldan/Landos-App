
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/account/account.html',
  'views/account/history',
  'models/account'
], function($, _, Backbone, accountContainerViewTemplate, AccountHistoryView, Account) {
  
  var AccountContainerView = Backbone.View.extend({
    el: "#canvas",
  
    template: Hogan.compile(accountContainerViewTemplate),
                                                  
    initialize: function() {
    },

    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);

      // Render the account history
      this.accountHistoryView = new AccountHistoryView({"model": new Account});
      this.accountHistoryView.update();
    }
});
  
  return AccountContainerView;
});
