
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/dashboard/dashboard.html',
  'views/dashboard/overview'
], function($, _, Backbone, dashboardContainerViewTemplate, OverviewView) {
  
  var DashboardContainerView = Backbone.View.extend({
    el: "#canvas",
  
    template: Hogan.compile(dashboardContainerViewTemplate),
                                                      
    events: {
      "click #overview_nav" : "showOverview",
      "click #grid_view_nav" : "showGridView",
      "click #list_view_nav" : "showListView",
      "click #user_view_nav" : "showUserView"
    },
                                                  
    initialize: function() {
    },

    render: function() {
      var data = {};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
      
      // Render the visible subview
      this.ov = new OverviewView;
      this.ov.render();
    },
                                                      
    showOverview: function(e) {
      e.preventDefault();
      this.ov.render();
    },

    showGridView: function(e) {
      e.preventDefault();
      //this.dt = this.dt || new DashboardTableView({"model" : Dashboard});
    },

    showListView: function(e) {
      e.preventDefault();
      //this.dv = this.dv || new DashboardListView({"model" : Dashboard});
    },
                                                      
    showUserView: function(e) {
      e.preventDefault();
    }
});
  
  return DashboardContainerView;
});
