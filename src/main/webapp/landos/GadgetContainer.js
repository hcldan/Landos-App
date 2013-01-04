define('landos/GadgetContainer', [
  'require',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin','
], function(require, lang, declare, _WidgetBase, _Container, _TemplatedMixin) {
  return declare([_WidgetBase, _Container, _TemplatedMixin], {
    templateString:
      '<div data-dojo-attach-point="containerNode">'
    + '</div>',
  });
});