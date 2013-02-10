define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred',
  'dojo/store/Memory',
  'dojo/store/Observable',
  'dojo/currency',
  'dijit/form/Button'
], function(require, landos, lang, declare, LazyContainer, Deferred, MemoryStore, Observable, currency, Button) {
  var undef;
  return declare(LazyContainer, {
    title: 'Order History',
    run: undef,
    store: Observable(new MemoryStore({data: []})),
    
    // private
    _timout: undef,
    
    // Attached via template
    _grid: undef,

    constructor: function (args) {
      declare.safeMixin(this, args);
    },
    
    postCreate: function() {
      this.inherited(arguments);
      
      if(this._loaded) {
        this._setCellFormatters();
        this._hookResize();
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
          +           '<th field="size" width="50px">Size</th>'
          +           '<th field="item" width="auto" sortDesc="1">Item</th>'
          +           '<th field="comments" width="120px">Comments</th>'
          +           '<th field="price" width="40px">Price</th>'
          +           '<th field="_item" width="80px">Reorder</th>'
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
      this._fetchNewData();
    },
    
    onHide: function() {
      this.inherited(arguments);
      if (this._dataTimeout)
        clearTimeout(this._dataTimeout);
    },
    
    /**
     * Fetches new data and sets up a schedule for periodic refresh.
     */
    _fetchNewData: function() {
      // Defer load until user is known
      landos.getViewer().then(lang.hitch(this, function (user) {
        var url = landos.getAPIUri('orders') + '?user=' + encodeURIComponent(user);
        osapi.http.get({format: 'json', href: url}).execute(lang.hitch(this, function (res) {
          if (res.status === 200 && !res.content.error) {
            var data = res.content,
                existing = {};
            this.store.query({}).forEach(function(item) {
              existing[item.id] = 1;
            });
      
            // Insert/Udate the local data store
            for (var i = 0; i < data.length; i++) {
              var item = data[i];
              if (existing[item.id])
                delete existing[item.id];
              this.store.put(item);
            }
            
            // Delete local items that were not in the freshly fetched data (remotely deleted)
            for(var item in existing) {
              if (existing.hasOwnProperty(item))
                this.store.remove(item);
            }
            
            // Refresh the grid
            if (this._grid) {
              this._grid.update();
              this._grid.render();
            }
          } else {
            console.error(res);
          }
        }));
      }));
    },
    
    /**
     * Hooks the window's resize and force the grid to update accordingly.
     */
    _hookResize: function() {
      var busy = new Deferred();
      this.busy(busy.promise);
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
        busy.resolve();
      }));
    },
    
    _setCellFormatters: function() {
      require(['dojo/data/ObjectStore'], lang.hitch(this, function(ObjectStore) {
        var structure = this._grid.get('structure'),
        columns = structure[0].cells[0];
        columns[3].formatter = lang.hitch(this, '_formatPrice');
        columns[4].formatter = lang.hitch(this, '_formatReorder');
        this._grid.set('structure', structure);
        this._grid.set('store', new ObjectStore({objectStore: this.store}));
        this._grid.update();
        this._grid.render();
      }));
    },
    
    _formatPrice: function(price) {
      return price ? ('$' + currency.format(price / 100)) : '';
    },
    _formatReorder: function(item) {
      return new Button({
        label: 'Reorder',
        onClick: function () {
          console.log(item);
        },
        disabled: this.orderDisabled
      });
    }
  });
});