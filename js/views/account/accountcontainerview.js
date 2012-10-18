
var AccountContainerView = Backbone.View.extend({
  el: "#container_account",

  initialize: function() {

    this.ahv = new AccountHistoryView({"model": new Account});
  },

  render: function() {
    this.ahv.render();
  }
});
