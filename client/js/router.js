
define([
  'jquery',
  'underscore',
  'backbone',
  'views/main/container',
  'views/order/container',
  'views/menu/container',
  'views/account/container',
  'views/dashboard/container'
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

    // Save credentials to sessionStorage
    sessionStorage.setItem("user", "bob");
    sessionStorage.setItem("runId", "324234234");
    
    router.on("route:showMain", function() {
      var mainContainerView = mainContainerView || new MainContainerView();
      mainContainerView.render();
    });
    
    router.on("route:showOrder", function() {
      var orderContainerView = orderContainerView || new OrderContainerView();
      orderContainerView.render();
    });
    
    router.on("route:showMenu", function() {
      var menuContainerView = menuContainerView || new MenuContainerView();
      menuContainerView.render();
    });
    
    router.on("route:showAccount", function() {
      var accountContainerView = accountContainerView || new AccountContainerView();
      accountContainerView.render();
    });
    
    router.on("route:showDashboard", function() {
      var dashboardContainerView = dashboardContainerView || new DashboardContainerView();
      dashboardContainerView.render();
    });
    
    Backbone.history.start();
    
    router.navigate("main_nav", {"trigger": "true"});
    
  };
  
  return {
    initialize: initialize
  };

});
