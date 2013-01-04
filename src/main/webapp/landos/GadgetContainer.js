define('landos/GadgetContainer', [
  'require',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin'
], function(require, lang, declare, _WidgetBase, _Container, _TemplatedMixin) {
  var undef;
  return declare([_WidgetBase, _Container, _TemplatedMixin], {
    // Template bindings
    /** {landos/LoadingPanel} loading panel widget */
    loading: undef,
    
    templateString:
      '<div class="container" data-dojo-attach-point="containerNode">'
    +  '<div data-dojo-type="landos/LoadingPanel" data-dojo-attach-point="loading"></div>'
    + '</div>',
    
    startup: function() {
      this.inherited(arguments);
      debugger;
    }
  });
});