
var ItemList = Backbone.Collection.extend({

  model: Item,

  initialize: function(options) {

    this.url = "/items2";
  },

  sum: function() {
    return this.reduce(function(memo, value){
      return memo + (parseFloat(value.get("price") * parseInt(value.get("quantity"))));
    }, 0);
  },

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
