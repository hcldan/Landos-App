
var OrderItemView = Backbone.View.extend({
  tagName: "tr",

  template: Hogan.compile($.trim($("#orderItem_tmpl").text())),

  events: {
    "click .icon-remove" : "remove"
  },

  remove: function(e) {

    this.model.destroy();
  },

  render: function() {
    this.$el.html(this.template.render(this.model.toJSON()));
    return this;
  }
});
