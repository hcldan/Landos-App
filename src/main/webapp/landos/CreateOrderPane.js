define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/_WidgetBase',
  'dojo/html'
], function(require, landos, lang, declare, _TemplatedMixin, _WidgetsInTemplateMixin, _WidgetBase, html) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString: '<div><p data-dojo-attach-point="runpara"></p></div>',
    title: 'Create ',
    constructor: function (runid) {
      this.runid = runid;
    },
    startup: function () {
      this.inherited(arguments);
      html.set(this.runpara, 'Managing run ' + this.runid + '.');
    }
  });
});