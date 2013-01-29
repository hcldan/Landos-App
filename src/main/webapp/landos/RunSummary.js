define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred',
  'dojo/store/Memory',
  'dojo/store/Observable'
], function(require, landos, lang, declare, LazyContainer, Deferred, MemoryStore, Observable) {
  var undef;
  return declare(LazyContainer, {
    title: 'Run Summary',
    runid: undef,
    store: Observable(new MemoryStore({data: []})),
    
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
        var busy = new Deferred();
        this.busy(busy.promise);
        require([
          'dojo/on',
          'dojo/dom-geometry',
          'dojo/data/ObjectStore'
        ], lang.hitch(this, function(on, domGeom, ObjectStore) {
          this._grid.setStore(new ObjectStore({objectStore: this.store}));
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
          busy.resolve();
        }));
      }
    },
    
    getRealTemplateString: function() {
      var def = new Deferred();
      require([
        'dojox/grid/DataGrid',
        'landos/LoadingPanel'
      ], function() {
        def.resolve(
            '<div data-dojo-attach-point="containerNode" class="noscroll">'
          +   '<div class="grid-container">'
          +     '<table data-dojo-attach-point="_grid" data-dojo-type="dojox/grid/DataGrid">'
          +       '<thead>'
          +         '<tr>'
          +           '<th field="displayItem" width="auto">Item</th>'
          +           '<th field="comments" width="250px">Comments</th>'
          +           '<th field="who" width="100px">For</th>'
          +           '<th field="price" width="50px">Price</th>'
          +           '<th field="paid" width="50px">Paid</th>'
          +         '</tr>'
          +       '</thead>'
          +     '</table>'
          +   '</div>'
          +   '<div data-dojo-type="landos/LoadingPanel" data-dojo-attach-point="_loading_cover"></div>'
          + '</div>'
        );
      });
      return def.promise;
    },
    
    onShow: function() {
      this.inherited(arguments);
      
      var url = landos.getAPIUri('orders') + this.runid;
      osapi.http.get({format: 'json', href: url}).execute(lang.hitch(this, function (res) {
        if (res.status === 200 && !res.content.error) {
          console.dir(res.content)
        } else {
          console.error(res);
        }
      }));
    }
  });
})