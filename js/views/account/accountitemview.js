
var AccountItemView = Backbone.View.extend({
  tagName: "dl",

  template: Hogan.compile($.trim($("#accountItem_tmpl").text())),

  render: function() {

    var context = this.model.toJSON();
    context.commentsSection = context.comments ? [{"comments" : context.comments}] : [];
    this.$el.html(this.template.render(context));
    return this;
  }
});
