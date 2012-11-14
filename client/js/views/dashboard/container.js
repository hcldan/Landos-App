
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/dashboard/dashboard.html',
  'views/dashboard/overview',
  'views/dashboard/table',
  'views/dashboard/list',
  'models/dashboard'
], function($, _, Backbone, dashboardContainerViewTemplate, OverviewView, DashboardTableView, DashboardListView, Dashboard) {
  
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
      var rendered = this.template.render({});
      this.$el.html(rendered);
      
      // Render the visible subview
      this.overview = new OverviewView;
      this.overview.render();
    },
                                                      
    showOverview: function(e) {
      e.preventDefault();
      this.overview.render();
    },

    showGridView: function(e) {
      e.preventDefault();
      this.tableView = new DashboardTableView({"model" : Dashboard});
    },

    showListView: function(e) {
      e.preventDefault();
      this.listView = new DashboardListView({"model" : Dashboard});
    },
                                                      
    showUserView: function(e) {
      e.preventDefault();
    }
});
  
  return DashboardContainerView;
});
