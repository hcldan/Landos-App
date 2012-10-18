
define([
  'jquery',
  'underscore',
  'backbone',
  'views/main/maincontainerview',
  'views/order/ordercontainerview',
  'views/menu/menucontainerview'
], function($, _, Backbone, MainContainerView, OrderContainerView, MenuContainerView){
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
    var orderContainerView = new OrderContainerView();
    var menuContainerView = new MenuContainerView();
    
    router.on("route:showMain", function() {
      mainContainerView.render();
    });
    
    router.on("route:showOrder", function() {
      orderContainerView.render();
    });
    
    router.on("route:showMenu", function() {
      menuContainerView.render();
    });
    
    router.on("route:showAccount", function() {
      $("#canvas").html("<h1>Account</h1>");
    });
    
    router.on("route:showDashboard", function() {
      $("#canvas").html("<h1>Dashboard</h1>");
    });
    
    Backbone.history.start();
    
    router.navigate("main_nav", {"trigger": "true"});
    
  };
  
  return {
    initialize: initialize
  };

});
