
define([
  'jquery',
  'underscore',
  'backbone',
  'io',
  'libs/bootstrap-typeahead',
  'text!templates/order/form.html',
  'models/item'
], function($, _, Backbone, io, typeahead, orderFormTemplate, Item) {
  
  /**
  * @Type: View
  * @Description: Represents the order form. Handles rendering, 
  * form validation, and prepopulating fields.
  * @Model: Item
  * @Events: itemAdded - Fires when a valid item is submitted to the server.
  */
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

    /* Cache selectors for easier reference. */
    bindFields: function() {
      this.$name = $("#name");
      this.$size = $("#size");
      this.$price = $("#price");
      this.$quantity = $("#quantity");
      this.$comments = $("#comments");

      // Set default value
      this.$quantity.val(this.model.get("quantity"));
    },
    
    addToOrder: function(e) {
      e.preventDefault();
      if (this.model.isValid()) {
        this.trigger("itemAdded", this.model);
        this.reset();
      } else {
        $("#add_to_order").effect("shake", { times:2 }, 150);
      }
    },

    setName: function(e) {
      this.clearError("name");
      this.model.set({"name": this.$name.val()}, {
        "error" : this.showError
      });
    },

    setSize: function(e) {
      this.model.set({"size": this.$size.val()});
    },

    setPrice: function(e) {
      this.clearError("price");
      this.model.set({"price": parseFloat(this.$price.val())}, {
        error : this.showError,
        success: this.showSuccess
      });
    },

    incrQuantity: function(e) {
      var quantity = parseInt(this.$quantity.text()) + 1;
      if (quantity > 10) {
        return;
      }
      this.model.set({"quantity": quantity});
      this.$quantity.text(this.model.get("quantity"));
    },

    dcrQuantity: function(e) {
      var quantity = parseInt(this.$quantity.text()) - 1;
      if (quantity < 1) {
        return;
      }
      this.model.set({"quantity": quantity});
      this.$quantity.text(this.model.get("quantity"));
    },

    setComments: function(e) {
      this.model.set({"comments": this.$comments.val()});
    },
                                             
    reset: function() {
      this.model = new Item;
      // move this to the item constructor
      this.model.view = this;
      // pass in as events hash
      this.model.on("change:name", this.populateSizeDropdown);
      // TODO: rename
      this.populateDropdown();

      // Reset fields
      this.$name.val("");
      this.$size.children().remove();
      this.$price.val("");
      this.$quantity.text("1");
      this.$comments.val("");
    },
                                             
    render: function() {
      var rendered = this.template.render({});
      this.$el.html(rendered);
      this.bindFields();
      this.populateDropdown();
      return this;
    },
    
    populateSizeDropdown: function(model, item) {
      // move this into closure
      var populateSizesDropdown = function(data, textStatus, jqXHR) {
        $("#size > option").remove();
        $("#size").append(new Option("Select a size"));
        for (var i = 0; i < data.length; i++) {
          $("#size").append(new Option(data[i]));
        }
      };
      io.makeRequest("/sizes/" + item, "GET", "", populateSizesDropdown);
    },
    
    populateDropdown : function() {
      // move this into closure
      var _populateDropdown = function(data, textStatus, jqXHR) {
        var items = _.map(data, function(item) {
          return item.name;
        });
        $("#name").typeahead({source: items});
      };
      io.makeRequest("/items", "GET", "", _populateDropdown);
    },

    showError: function(model, location) {
      var errors = {
        "name" : "Please enter a valid name",
        "size" : "Please enter a valid size",
        "price" : "Please enter a valid price",
        "quantity" : "Please enter a valid quantity",
        "comments" : "",
      }
      var $input = $("#" + location + "_input");
      $input.addClass("error");

      var $helpLocation = $("#help-" + location);
      var error = errors[location];
      $helpLocation.html(error);
    },

    showSuccess: function(model, location) {
      debugger;
    },

    clearError:function(location) {
      var $input = $("#" + location + "_input");
      $input.removeClass("error");
      var $helpLocation = $("#help-" + location);
      $helpLocation.html("");      
    }
});
  
  return OrderFormView;
});
