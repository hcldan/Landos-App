
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/account/account.html',
  'views/account/history',
  'models/account'
], function($, _, Backbone, accountContainerViewTemplate, AccountHistoryView, Account) {

  // The main container for the account view. Attaches to the main rendering
  // canvas and initializes the AccountHistory subview. 
  var AccountContainerView = Backbone.View.extend({
    el: "#canvas",
  
    template: Hogan.compile(accountContainerViewTemplate),

    render: function() {
      // Create the view before initializing subviews. Otherwise, the subviews
      // will not have a DOM element to attach to.
      var rendered = this.template.render({});
      this.$el.html(rendered);

      // Render subviews
      // Ideally, a new view should not be created each time the container
      // is rendered. However, 
      // it does make it substantially easier to ensure that account data is up 
      // to date.
      this.accountHistoryView = new AccountHistoryView({"model": new Account});
      this.accountHistoryView.update();
    }
});
  
  return AccountContainerView;
});
