
define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'collapse'
], function($, _, Backbone, Router, collapse){
  var initialize = function(){
    Router.initialize();
  };

  return {
    initialize: initialize
  };
});
