define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/html',
  'dojo/Deferred',
  'dojo/on',
  'dijit/Dialog',
  'dojo/io-query'
], function(require, landos, lang, declare, LazyContainer, html, Deferred, on, Dialog, ioQuery) {
  
  return declare(LazyContainer, {
    title: 'Place Order',
    
    constructor: function (args) {
      declare.safeMixin(this, args);
      if (this.disabled) {
        this.title += ' (expired)';
      }
    },
        
    getRealTemplateString: function() {
      var def = new Deferred();
      osapi.http.get({format: 'json', href: landos.getAPIUri('run') + this.runid}).execute(lang.hitch(this, function (res) {
        if (res.status === 200 && !res.content.error) {
          // Run exists
          require([  
            'dijit/form/Form',
            'landos/FilteringSelect',
            'dijit/form/CurrencyTextBox',
            'dijit/form/TextBox',
            'dijit/form/NumberSpinner'
          ], function() {
            def.resolve(
                '<div data-dojo-attach-point="containerNode">'
              +   '<p>Placing an order for run ${runid}.</p>'
              +   '<form data-dojo-type="dijit/form/Form" data-dojo-attach-point="form">'
              +     '<table>'
              +       '<tr>'
              +         '<td><label for="item">Item:</label></td>'
              +         '<td><div id="item" name="item" data-dojo-type="landos/FilteringSelect" data-dojo-attach-point="item"></div></td>'
              +       '</tr>'
              +       '<tr>'
              +         '<td><label for="size">Size:</label></td>'
              +         '<td><input id="size" name="size" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-attach-point="size" /></td>'
              +       '</tr>'
              +       '<tr>'
              +         '<td><label for="price">Price:</label></td>'
              +         '<td><input id="price" name="price" type="text" data-dojo-type="dijit/form/CurrencyTextBox" data-dojo-attach-point="price" required /></td>'
              +       '</tr>'
              +       '<tr>'
              +         '<td><label for="comments">Comments:</label></td>'
              +         '<td><input id="comments" name="comments" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-attach-point="comments" /></td>'
              +       '</tr>'
              +       '<tr><td><input type="submit" data-dojo-type="dijit/form/Button" data-dojo-attach-point="submit" label="Create" /></td></tr>'
              +   '</form>'
              +   '<div data-dojo-type="landos/LoadingPanel" data-dojo-attach-point="_loading_cover"></div>'
              + '</div>'  
            );
          });
        } else {
          // Run doesn't exist or other error
          def.resolve('<div data-dojo-attach-point="containerNode">Error: run doesn\'t exist or there was an error retrieving run details.</div>');
        }
      }));
      
      return def.promise;
    },
    
    postCreate: function () {
      this.inherited(arguments);
      
      if (this._loaded && this.submit)
        on(this.submit, 'click', lang.hitch(this, '_onSubmit'));
    },
    
    _onSubmit: function () {
      if (!this.form.isValid()) {
        this.form.validate();
        return false;
      }
      
      var values = this.form.getValues();
      
      // Defer request until username is known (use viewer promise)
      landos.getViewer().then(lang.hitch(this, function (id) {
        values.user = id;
        values.item = this.item.getDisplayedValue();
        values.price = (Number(values.price) * 100).toFixed(0);
        // Construct url
        var url = landos.getAPIUri('orders') + this.runid + '?' + ioQuery.objectToQuery(values);
        
        osapi.http.put({format: 'json', href: url}).execute(lang.hitch(this, function (res) {
          if (res.status === 200 && !res.content.error) {
            new Dialog({
              title: 'Success!',
              content: 'Created new order.'
            }).show();
            this.form.reset();
          } else {
            new Dialog({
              title: 'Error!',
              content: 'There was an error creating your order. Please try again later.'
            }).show();
          }
        }));
      }));

      return false;
    }
    
  });
  
});