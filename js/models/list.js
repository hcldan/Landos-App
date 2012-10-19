
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  var ItemNameList = Backbone.Model.extend({
    initialize: function() {
      this.url = "/items";
    },
                                             
    toJSON: function() {
      return _.map(data, function(item) {
        return item.name;
      });
    }
  });
  return ItemNameList;
});
