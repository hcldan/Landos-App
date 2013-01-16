define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_TemplatedMixin',
  'dijit/layout/ContentPane',
  'dojo/dom-class'
], function(require, landos, lang, declare, _TemplatedMixin, ContentPane, domClass) {
  return declare([ContentPane, _TemplatedMixin], {
    templateString: '<p>This is where runs will be created.</p>'
  });
});