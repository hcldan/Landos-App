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
  'dijit/form/Button',
  'dojo/io-query',
  'dijit/Dialog'
], function(require, landos, lang, declare, LazyContainer, Deferred, MemoryStore, Observable, currency, Button, ioQuery, Dialog) {
  var undef;
  return declare(LazyContainer, {
    title: 'Order History',
    run: undef,
    store: Observable(new MemoryStore({data: []})),
    
    // private
    _timout: undef,
    
    // Attached via template
    _grid: undef,

    // stores buttons for re-ordering
    _buttons: [],

    constructor: function (args) {
      declare.safeMixin(this, args);
    },

    disableButtons: function () {
      // Make sure future buttons are disabled when created
      this.orderDisabled = true;
      // Disable each button
      this._buttons.forEach(function (b) {
        b.set('disabled', true);
      });
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
          +     '<table data-dojo-attach-point="_grid" sortInfo="1" clientSort="true" data-dojo-type="dojox/grid/DataGrid">'
          +       '<thead>'
          +         '<tr>'
          +           '<th field="end" width="80px" sortDesc="true">Date</th>'
          +           '<th field="size" width="50px">Size</th>'
          +           '<th field="item" width="auto">Item</th>'
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
      this._fetchData();
    },
    
    onHide: function() {
      this.inherited(arguments);
      if (this._dataTimeout)
        clearTimeout(this._dataTimeout);
    },
    
    /**
     * Fetches new data.
     */
    _fetchData: function() {
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
        columns[0].formatter = lang.hitch(this, '_formatDate');
        columns[4].formatter = lang.hitch(this, '_formatPrice');
        columns[5].formatter = lang.hitch(this, '_formatReorder');
        this._grid.set('structure', structure);
        this._grid.set('store', new ObjectStore({objectStore: this.store}));
        this._grid.update();
        this._grid.render();
      }));
    },
    
    _formatDate: function (millis) {
      var d = new Date(millis);
      return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    },
    _formatPrice: function (price) {
      return price ? ('$' + currency.format(price / 100)) : '';
    },
    _formatReorder: function (item) {
      // Create Button
      var b = new Button({
        label: 'Reorder',
        disabled: this.orderDisabled,
        onClick: lang.hitch(this, function () {
          var busy = new Deferred();
          this.busy(busy);
          
          // Defer request until username is known
          landos.getViewer().then(lang.hitch(this, function (id) {
            // Remove paid marker
            delete item.paid;
            // Construct url
            var url = landos.getAPIUri('orders') + this.run.id + '?' + ioQuery.objectToQuery(item);
            console.log(url);
            // Submit put request
            osapi.http.put(lang.mixin({href: url}, landos.getRequestParams(id))).execute(lang.hitch(this, function (res) {
              if (res.status === 200 && !res.content.error) {
                busy.resolve(res);
                // Refresh grid
                this._fetchData();
                // Display success message
                new Dialog({
                  title: 'Success!',
                  content: 'Created new order.'
                }).show();
              } else {
                busy.reject(res);
                new Dialog({
                  title: 'Error!',
                  content: 'There was an error creating your order. Please try again later.'
                }).show();
              }
            }));
          }));
        })
      });
      // Add button to collection if not disabled
      if (!this.orderDisabled) {
        this._buttons.push(b);
      }
      // Return button
      return b;
    }
  });
});