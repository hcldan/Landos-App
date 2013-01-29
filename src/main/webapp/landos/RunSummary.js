define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred'
], function(require, landos, lang, declare, LazyContainer, Deferred, on) {
  var undef;
  return declare(LazyContainer, {
    title: 'Run Summary',
    runid: undef,
    
    // private
    _timout: undef,
    
    // Attached via template
    _grid: undef,
    
    constructor: function(runid) {
      this.runid = runid;
    },
    
    postCreate: function() {
      this.inherited(arguments);
      
      if(this._loaded) {
        require(['dojo/on', 'dojo/dom-geometry'], lang.hitch(this, function(on, domGeom) {
          on(window, 'resize', lang.hitch(this, function(event) {
            if (!this._timeout) {
              this._timeout = setTimeout(lang.hitch(this, function() {
                delete this._timeout;
                var dimen = domGeom.getContentBox(this._grid.domNode.parentNode);
                this._grid.resize(dimen, dimen);
                this._grid.update();
              }), 50);
            }
          }));
        }));
      }
    },
    
    getRealTemplateString: function() {
      var def = new Deferred();
      require([  
        'dojox/grid/DataGrid'
      ], function() {
        def.resolve(
            '<div data-dojo-attach-point="containerNode" class="noscroll">'
          +   '<div class="grid-container">'
          +     '<table data-dojo-attach-point="_grid" data-dojo-type="dojox/grid/DataGrid">'
          +       '<thead>'
          +         '<tr>'
          +           '<th field="displayItem">Item</th>'
          +           '<th field="who" width="200px">For</th>'
          +           '<th field="paid" cellType="dojox.grid.cells.Bool" width="75px">Paid</th>'
          +         '</tr>'
          +       '</thead>'
          +     '</table>'
          +   '</div>'
          + '</div>'
        );
      });
      return def.promise;
    }
  });
})