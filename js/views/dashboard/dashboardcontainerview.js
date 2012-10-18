
var DashboardContainerView = Backbone.View.extend({
  el: "#container_dashboard",

  events: {
    "click #create_run" : "createRun",
    "click #overview_nav" : "showOverview",
    "click #grid_view_nav" : "showGridView",
    "click #list_view_nav" : "showListView",
    "click #user_view_nav" : "showUserView"
  },

  initialize: function() {
    this.ov = new OverviewView;
    this.dv = new DashboardListView({"model" : Dashboard});
    this.dt = new DashboardTableView({"model" : Dashboard});
  },

  render: function() {
    this.ov.render();
    this.dv.render();
    this.dt.render();
  },

  showOverview: function(e) {
    e.preventDefault();
    $(".nav-tabs > .active").removeClass("active");
    $("#overview").addClass("visible");
    $("#overview_nav").parent().addClass("active");
    $("#grid_view").removeClass("visible");
    $("#list_view").removeClass("visible");
  },

  showGridView: function(e) {
    e.preventDefault();
    $(".nav-tabs > .active").removeClass("active");
    $("#grid_view").addClass("visible");
    $("#grid_view_nav").parent().addClass("active");
    $("#list_view").removeClass("visible");
    $("#overview").removeClass("visible");
  },

  showListView: function(e) {
    e.preventDefault();
    $(".nav-tabs > .active").removeClass("active");
    $("#list_view_nav").parent().addClass("active");
    $("#list_view").addClass("visible");
    $("#grid_view").removeClass("visible");
    $("#overview").removeClass("visible");;
  },
                                                    
  showUserView: function(e) {
    e.preventDefault();
  },

  createRun: function(e) {
    var _createRun = function(data, textStatus, jqXHR) {
      if (textStatus === "success") {
        var currentRun = function(data, textStatus, jqXHR) {
         $("#current_run").append("<strong>" + data.run_id + "</strong>");
        };
        io.makeRequest("/run/current", "GET,", "", currentRun);
      } else {
        $("#current_run").append("<strong>There is currently no run</strong>");
      }
    };
    io.makeRequest("/run/create", 
                   "POST", 
                   JSON.stringify({"user" : gUserId}), 
                   _createRun);
  }
});
