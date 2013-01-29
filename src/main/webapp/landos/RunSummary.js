define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred'
], function(require, landos, lang, declare, LazyContainer, Deferred) {
  return declare(LazyContainer, {
    title: 'Run Summary',
    
    constructor: function(runid) {
      
    },
    
    getRealTemplateString: function() {
      var def = new Deferred();
      require([  

      ], function() {
        def.resolve(
            '<div data-dojo-attach-point="containerNode">'

          + '</div>'      
        );
      });
      return def.promise;
    }
  });
})