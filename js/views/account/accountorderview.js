
var AccountOrderView = Backbone.View.extend({
  tagName: "div",

  "className": "row span8",

  template: Hogan.compile($.trim($("#accountOrder_tmpl").text())),

  render: function() {
    this.$el.html(this.template.render(this.model.toJSON()));
    return this;
  }
});
