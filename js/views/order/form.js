
define([
  'jquery',
  'underscore',
  'backbone',
  'io',
  'libs/bootstrap-typeahead',
  'text!/templates/order/form.html'
], function($, _, Backbone, io, typeahead, orderFormTemplate) {
  
  var OrderFormView = Backbone.View.extend({
    el: "#order_form",
                                             
    template: Hogan.compile(orderFormTemplate),
                                            
    events: {
      "click #add_to_order": "addToOrder",
      "change #name" : "setName",
      "change #size" : "setSize",
      "change #price" : "setPrice",
      "click #quantity-incr" : "incrQuantity",
      "click #quantity-dcr" : "dcrQuantity",
      "change #comments" : "setComments"
    },
                                             
    initialize: function() {
      this.model.view = this;
      this.model.on("change:name", this.populateSizeDropdown);
    },
                                             
    bindFields: function() {
      this.name = $("#name");
      this.size = $("#size");
      this.price = $("#price");
      this.quantity = $("#quantity");
      this.comments = $("#comments");
      this.quantity.val(this.model.get("quantity"));
    },
    
    addToOrder: function(e) {
      if (this.model.isValid()) {
        this.trigger("itemAdded", this.model);
        this.reset();
      } else {
        $("#add_to_order").effect("shake", { times:2 }, 150);
      }
    },
      
    populateDropdown : function() {
      var _populateDropdown = function(data, textStatus, jqXHR) {
        var items = _.map(data, function(item) {
          return item.name;
        });
      $("#name").typeahead({source: items});
      };
      io.makeRequest("/items", "GET", "", _populateDropdown);
    },
                                             
    setName: function(e) {
      this.model.set({"name": this.name.val()}, {"error" : function() {  }});
    },

    setSize: function(e) {
      this.model.set({"size": this.size.val()});
    },

    setPrice: function(e) {
      debugger;
      this.model.set({"price": parseFloat(this.price.val())});
    },

    incrQuantity: function(e) {
      var quantity = parseInt(this.quantity.text()) + 1;
      if (quantity > 10) {
        return;
      }
      this.model.set({"quantity": quantity});
      this.quantity.text(this.model.get("quantity"));
    },

    dcrQuantity: function(e) {
      var quantity = parseInt(this.quantity.text()) - 1;
      if (quantity < 1) {
        return;
      }
      this.model.set({"quantity": quantity});
      this.quantity.text(this.model.get("quantity"));
    },

    setComments: function(e) {
      this.model.set({"comments": this.comments.val()});
    },
    
    populateSizeDropdown: function(model, item) {
      var populateSizesDropdown = function(data, textStatus, jqXHR) {
        if (textStatus === "success") {
          $("#size > option").remove();
          $("#size").append(new Option("Select a size"));
          for (var i = 0; i < data.length; i++) {
            $("#size").append(new Option(data[i]));
          }
        } else {
          $("#size").append(new Option("Select a size"));
          $("#size").append(new Option("Mini"));
          $("#size").append(new Option("Small"));
          $("#size").append(new Option("Large"));
        }
      };
        io.makeRequest("/sizes/" + item, "GET", "", populateSizesDropdown);
    },

    reset: function() {
      this.model = new Item;
      this.name.val("");
      this.size.children().remove();
      this.price.val("");
      this.quantity.text("1");
      this.comments.val("");
    },
                                             
    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);
      this.bindFields();
      this.populateDropdown();
      return this;
    }
});
  
  return OrderFormView;
});
