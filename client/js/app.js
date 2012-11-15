
define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'collapse'
], function($, _, Backbone, Router, collapse){
  // All application logic is controlled by the router.
  var initialize = function(){
    Router.initialize();
  };

  return {
    initialize: initialize
  };
});
