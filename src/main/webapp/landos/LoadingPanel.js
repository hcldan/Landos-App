define('landos/GadgetContainer', [
  'require',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin',
  'dojo/dom-class'
], function(require, lang, declare, _WidgetBase, _Container, _TemplatedMixin, domClass) {
  return declare([_WidgetBase, _Container, _TemplatedMixin], {   
    templateString:
      '<div class="loadinPanel dijitHidden" data-dojo-attach-point="containerNode">'
    +   '<div class="animation"></div>'
    + '</div>',
    
    show: function() {
      domClass.remove(this.domNode, 'dijitHidden');
    }, 
    
    hide: function() {
      domClass.add(this.domNode, 'dijitHidden');
    }
  });
});