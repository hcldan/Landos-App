
var OverviewView = Backbone.View.extend({
  el: "#overview",
                                          
  render: function() {
    this.$el.addClass("visible");
        
    var currentRun = function(data, textStatus, jqXHR) {
      if (data.run_id) {
        $("#current_run").html("<strong>" + data.run_id + "</strong>");
      } else {
        $("#current_run").html("<strong>There is no run at the moment.</strong>");
      }
    };
    io.makeRequest("/run/current", "GET,", "", currentRun);
  }
});
