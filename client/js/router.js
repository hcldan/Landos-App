
define([
  'jquery',
  'underscore',
  'backbone',
  'views/nav/nav',
  'views/main/container',
  'views/order/container',
  'views/menu/container',
  'views/account/container',
  'views/dashboard/container',
  'utils'
], function($, _, Backbone,
            NavView,
            MainContainerView, 
            OrderContainerView, 
            MenuContainerView,
            AccountContainerView,
            DashboardContainerView,
            Utils){
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

    var navView = new NavView();
    navView.render();

    router.on("route:showMain", function() {
      var mainContainerView = mainContainerView || new MainContainerView()
      mainContainerView.on("click:order", function() {
        router.navigate("order_nav", {"trigger": "true"});
      })
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
