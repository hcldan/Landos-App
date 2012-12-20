
define([
  'jquery',
  'underscore',
  'backbone',
  'io',
  'text!templates/dashboard/overview.html'
], function($, _, Backbone, io, overviewViewTemplate) {
  
  var OverviewView = Backbone.View.extend({
    el: "#dashboard_canvas",
  
    template: Hogan.compile(overviewViewTemplate),
    
    events: {
      "click #create_run" : "createRun"
    },
                                            
    initialize: function() {
    },

    render: function() {
      var data = {"run_id" : "use real run id"};
      var rendered = this.template.render(data);
      this.$el.html(rendered);
    },
                                            
    createRun: function() {
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
  
  return OverviewView;
});
