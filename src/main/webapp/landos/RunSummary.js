define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred'
], function(require, landos, lang, declare, LazyContainer, Deferred) {
  var undef;
  return declare(LazyContainer, {
    title: 'Run Summary',
    runid: undef,
    
    // Attached via template
    _grid: undef,
    
    constructor: function(runid) {
      this.runid = runid;
    },
    
    getRealTemplateString: function() {
      var def = new Deferred();
      require([  
        'dojox/grid/DataGrid'
      ], function() {
        def.resolve(
            '<div data-dojo-attach-point="containerNode">'
          +   '<table data-dojo-attach-point="_grid" data-dojo-type="dojox/grid/DataGrid">'
          +     '<thead>'
          +       '<tr>'
          +         '<th field="displayItem">Item</th>'
          +         '<th field="who" width="200px">For</th>'
          +         '<th field="paid" cellType="dojox.grid.cells.Bool" width="75px">Paid</th>'
          +       '</tr>'
          +     '</thead>'
          +   '</table>'
          + '</div>'
        );
      });
      return def.promise;
    }
  });
})