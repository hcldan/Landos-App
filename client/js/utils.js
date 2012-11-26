
define([
  'jquery',
  'underscore',
  'backbone',
  'io'
], function($, _, Backbone, io) {
  
  // Basic utilities for retrieving static application information.  
  var Utils = function() {
    var self = this;

    this.getUserId = function() {
      return gUserId;
    };

    this.getRunId = function() {
      return gRunId;
    };

    this.getHeaders = function() {
      var user = self.getUserId();
      var runId = self.getRunId();
      return {'Authorization' : "Basic ".concat(btoa(user.concat(":", runId)))};
    };

    this.getStatus = function() {
      var run = "There is a run today.";
      var noRun = "There is no run today.";
      return self.isRun() ? run : noRun;
    };

    this.isRun = function() {
      return self.getRunId() !== "";
    };

    // this should make a request to the server and take a callback
    this.isAdmin = function() {
      var userId = self.getUserId();
      return userId.indexOf("roneill") !== -1 || userId.indexOf("ddumont") !== -1;
    }
  };

  return new Utils;
});
