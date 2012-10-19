
define([
  'jquery',
  'underscore',
  'backbone',
  'views/main/maincontainerview',
  'views/order/ordercontainerview',
  'views/menu/menucontainerview',
  'views/account/accountcontainerview',
  'views/dashboard/dashboardcontainerview'
], function($, _, Backbone, 
            MainContainerView, 
            OrderContainerView, 
            MenuContainerView,
            AccountContainerView,
            DashboardContainerView){
  var MainRouter = Backbone.Router.extend({
    routes: {
      "main_nav":    "showMain",
      "order_nav":   "showOrder",
      "menu_nav":    "showMenu",
      "account_nav": "showAccount",
      "dashboard_nav": "showDashboard"
    }
  });
  
  var initialize = function() {
    var router = new MainRouter();
    
    var mainContainerView = new MainContainerView();
    //var orderContainerView = new OrderContainerView();
    var menuContainerView = new MenuContainerView();
    var accountContainerView = new AccountContainerView();
    var dashboardContainerView = new DashboardContainerView();
    
    router.on("route:showMain", function() {
      mainContainerView.render();
    });
    
    router.on("route:showOrder", function() {
      var orderContainerView = new OrderContainerView();
      orderContainerView.render();
    });
    
    router.on("route:showMenu", function() {
      menuContainerView.render();
    });
    
    router.on("route:showAccount", function() {
      accountContainerView.render();
    });
    
    router.on("route:showDashboard", function() {
      dashboardContainerView.render();
    });
    
    Backbone.history.start();
    
    router.navigate("main_nav", {"trigger": "true"});
    
  };
  
  return {
    initialize: initialize
  };

});
