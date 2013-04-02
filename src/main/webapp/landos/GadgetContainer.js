define([
  // Used in callback:
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred',
  'dojo/html',
  'dojo/on',
  'dijit/Dialog',
  'dijit/layout/ContentPane',
  'dijit/form/Button',
  'landos/SubscribeButton',
  'dijit/layout/TabContainer',
  'dijit/layout/ContentPane'
], function(landos, lang, declare, LazyContainer, Deferred, html, on, Dialog, ContentPane) {
  var undef;
  var isEmbedded = gadgets.views.getCurrentView().getName() == 'embedded';
      menuLink = 'http://thecheesesteakguys.com/landos/';

  return declare(LazyContainer, {
    templateString:
        '<div class="container" data-dojo-attach-point="containerNode">'
      +   '<div id="tabs" data-dojo-type="dijit/layout/TabContainer" data-dojo-attach-point="tabs">'
      +     '<div id="tab-welcome" data-dojo-type="dijit/layout/ContentPane" title="Welcome">'
      +       '<p>Welcome to the Lando\'s App!</p>'
      +       '<p data-dojo-attach-point="runpara"></p>'
      +     '</div>'
      +   '</div>'
      +   '<h1>The Lando\'s App</h1>'
      +   '<div id="buttons">'
      +     '<a data-dojo-attach-point="browse" href="' + menuLink + '" target="_blank">Browse Menu</a>'
      +     '<button data-dojo-type="landos/SubscribeButton">Sign me up!</button>'
      +   '</div>'
      + '</div>',
    
    /** {dojo/Deferred<Object>} deferred containing the run info */
    run: new Deferred(),
    
    
    /** {dojo/Deferred<boolean>} deferred containing the admin status of the user. */
    adminStatus: new Deferred(),
    
    // Other variables
    /** {boolean} Subscription status */
    subscribed: undef,

    startup: function() {
      this.inherited(arguments);
      
      var onData = new Deferred();
      onData.then(lang.hitch(this, function(result) {
        var data = (((result || {}).subscribe || {}).content || {});  
        this.set('subscribed', !!data.subscribed);
        this.adminStatus.resolve(!!data.admin);
      })).otherwise(lang.hitch(this, function(reason) {
        gadgets.error(reason);
      }));
      
      landos.getViewer().then(lang.hitch(this, function(viewer) {
        require(['landos/CreateRunPane'], lang.hitch(this, function(CreateRunPane) {
          this.adminStatus.then(lang.hitch(this, function(isAdmin) {
            if (isAdmin) {
              this.tabs.addChild(new CreateRunPane(), Math.min(4, this.tabs.getChildren().length));
            }
          }));
        }));
                
        var params = landos.getRequestParams(viewer),
          batch = osapi.newBatch()
            .add('data', osapi.http.get(lang.mixin({ 
              href: landos.getAPIUri('data') 
            }, params)))
            .add('subscribe', osapi.http.get(lang.mixin({
              href: landos.getAPIUri('subscribe')  + encodeURIComponent(viewer)
            }, params)));
    
        landos.processOSAPIBatchResponse(batch, onData);
      })).otherwise(function(error) {
        onData.reject(error);
      }); 
      
      gadgets.util.registerOnLoadHandler(lang.hitch(this, function() {
        if (isEmbedded) {
          // Listen for EE context (which should come pretty fast after rendering the gadget).
          opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', lang.hitch(this, function (key) {
            var data = opensocial.data.getDataContext().getDataSet(key);
            this.run.resolve(data);
          }));
        } else {
          // No EE context, so ask the server if there is a current run.
          osapi.http.get({format: 'json', href: landos.getAPIUri('run')}).execute(lang.hitch(this, function (res) {
            var content = res.content;
            if (res.status === 200 && content.id) {
              this.run.resolve(content);
            }
          }));
        }
      }));
      
      this.run.then(lang.hitch(this, function(run) {
        this.adminStatus.then(lang.hitch(this, function(isAdmin) {
          if (isAdmin) {
            require(['landos/RunSummary'], lang.hitch(this, function(RunSummary) {
              this.tabs.addChild(new RunSummary(run), Math.min(3, this.tabs.getChildren().length));
            }));
          }
        }));
        this.showOrderForm(run);
      }));

      // Handle browse button click
      on(this.browse, 'click', lang.hitch(this, function (e) {
        // If we aren't embedded, open up a view. Otherwise, continue as normal.
        if (!isEmbedded) {
          e.preventDefault();
          gadgets.views.openUrl(menuLink, undefined, 'dialog');
        }
      }));
    },
    
    showOrderForm: function(run) {
      html.set(this.runpara, 'Viewing run ' + run.id + '.');
      require(['landos/CreateOrderPane', 'landos/OrderHistoryPane'], lang.hitch(this, function(CreateOrderPane, OrderHistoryPane) {
        var time = new Date().getTime();
        var expired = time >= run.end;
        var cop = new CreateOrderPane({
          run: run,
          disabled: expired
        });
        var ohp = new OrderHistoryPane({
          run: run,
          disabled: expired
        });
        this.tabs.addChild(cop, Math.min(1, this.tabs.getChildren().length));
        this.tabs.addChild(ohp, Math.min(2, this.tabs.getChildren().length));
        if (!expired) {
          setTimeout(function () {
            ohp.disableButtons();
            cop.set('disabled', true);
          }, run.end - time);
        }
      }));
    }
  });
});
