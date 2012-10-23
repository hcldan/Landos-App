
define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone) {
  
  var Utils = function() {
    this.getHeaders = function() {
      var user = sessionStorage.getItem("user");
      var runId = sessionStorage.getItem("runId");
      return {'Authorization' : "Basic ".concat(btoa(user.concat(":", runId)))};
    };

    this.getStatus = function() {
      var status = "There is a run today."
      return status;
    }

    this.isRun = function() {
      return true;
    }
  };
  return new Utils();
});
