define([
  // Used in callback:
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred',
  'dojo/html'
], function(landos, lang, declare, LazyContainer, Deferred, html, CreateOrderPane) {
  var undef;
  return declare(LazyContainer, {
    /** {dojo/Deferred<string>} deferred containing the runid */
    runid: new Deferred(),
    
    // Other variables
    /** {boolean} Subscription status */
    subscribed: undef,
    
    getRealTemplateString: function() {
      var def = new Deferred();
      require([  
        'landos/SubscribeButton',
        'dijit/layout/TabContainer',
        'dijit/layout/ContentPane'
      ], function() { 
        def.resolve(
            '<div class="container" data-dojo-attach-point="containerNode">'
          +   '<div id="tabs" data-dojo-type="dijit/layout/TabContainer" data-dojo-attach-point="tabs">'
          +     '<div id="tab-welcome" data-dojo-type="dijit/layout/ContentPane" title="Welcome">'
          +       '<p>Welcome to the Lando\'s App!</p>'
          +       '<p data-dojo-attach-point="runpara"></p>'
          +     '</div>'
          +   '</div>'
          +   '<h1>The Lando\'s App</h1>'
          +   '<button class="subscribe" data-dojo-type="landos/SubscribeButton">Sign me up!</button>'
          + '</div>'     
        );
      });
      return def.promise;
    },

    startup: function() {
      this.inherited(arguments);
      
      // startup gets called twice because the widget loads before the real template is gotten (onshow)
      if (!this._loaded) {
        var onData = new Deferred();
        onData.then(lang.hitch(this, function(result) {
          this.set('subscribed', result.subscribe.content.subscribed);
        })).otherwise(lang.hitch(this, function(reason) {
          gadgets.error(reason);
        }));
        
        landos.getViewer().then(lang.hitch(this, function(viewer) {
          require(['landos/CreateRunPane'], lang.hitch(this, function(CreateRunPane) {
            this._loadpromise.then(lang.hitch(this, function() {
              this.tabs.addChild(new CreateRunPane());  
            }));
          }));
                  
          var params = landos.getRequestParams(viewer),
            batch = osapi.newBatch()
              .add('data', osapi.http.get(lang.mixin({ 
                href: landos.getAPIUri('data') 
              }, params)))
              .add('subscribe', osapi.http.get(lang.mixin({
                href: landos.getAPIUri('subscribe')  + '/' + encodeURIComponent(viewer)
              }, params)));
      
          landos.processOSAPIBatchResponse(batch, onData);
        })).otherwise(function(error) {
          onData.reject(error);
        }); 
        
        gadgets.util.registerOnLoadHandler(lang.hitch(this, function() {
          // Listen for EE context (which should come pretty fast after rendering the gadget).
          opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', lang.hitch(this, function (key) {
            if (!this.runid.isResolved()) {
              this.runid.resolve(opensocial.data.getDataContext().getDataSet(key).runid);
            }
          }));
          
          // If we've not gotten anything after a second, ask the server for the current run info.
          setTimeout(lang.hitch(this, function() {
            if (!this.runid.isResolved()) {
              osapi.http.get({format: 'json', href: landos.getAPIUri('run')}).execute(lang.hitch(this, function (res) {
                var content = res.content;
                if (res.status === 200 && content.id) {
                  if (!this.runid.isResolved() && content.id) {
                    this.runid.resolve(content.id);
                  }
                }
              }));
            }
          }), 1000);
        }));
        
        this.runid.then(lang.hitch(this, 'showOrderForm'));
      }
      
      this.onShow();
    },
    
    showOrderForm: function(runid) {
      html.set(this.runpara, 'Managing run ' + runid + '.');
      require(['landos/CreateOrderPane'], lang.hitch(this, function(CreateOrderPane) {
        this._loadpromise.then(lang.hitch(this, function() {
          this.tabs.addChild(new CreateOrderPane(runid));
        }));
      }));
    }
  });
});