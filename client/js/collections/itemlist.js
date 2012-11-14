
define([
  'jquery',
  'underscore',
  'backbone',
  'models/item'
], function($, _, Backbone, Item) {
  // ### Name 
  // ItemList
  // ### Type 
  // Collection
  // ### Description
  // Holds a list of items client-side and synchronizes with the server.
  // ### Endpoint
  // /items2
  var ItemList = Backbone.Collection.extend({
  model: Item,

  initialize: function(options) {
    this.url = "/items2";
  },

  // Returns the total price of all the items in the list.
  sum: function() {
    return this.reduce(function(memo, value){
      return memo + (parseFloat(value.get("price") * parseInt(value.get("quantity"))));
    }, 0);
  },

  // Override the default JSON structure of the collection.
  toJSON: function() {
    return {
      "items":
        this.map(function(item) {
          return {
            "id" : item.attributes.id,
            "name" : item.attributes.name,
            "size" : item.attributes.size,
            "price" : item.attributes.price,
            "quantity" : item.attributes.quantity,
            "comments" : item.attributes.comments
          };
        })
      };
    }
});
  
  return ItemList;
});
