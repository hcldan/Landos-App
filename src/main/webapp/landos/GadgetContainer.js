define([
  // Used in callback:
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dojo/Deferred',
  'dojo/html',
  'landos/SubscribeButton',
  'dijit/layout/TabContainer',
  'dijit/layout/ContentPane'
], function(landos, lang, declare, LazyContainer, Deferred, html) {
  var undef;
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
      +   '<button class="subscribe" data-dojo-type="landos/SubscribeButton">Sign me up!</button>'
      + '</div>',
    
    /** {boolean} If the runid resolved is expired or not.  Make sure to set before resolving the runid. */
    runExpired: false,
    /** {dojo/Deferred<string>} deferred containing the runid */
    runid: new Deferred(),
    
    
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
              this.tabs.addChild(new CreateRunPane());
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
        if (gadgets.views.getCurrentView().getName() == 'embedded') {
          // Listen for EE context (which should come pretty fast after rendering the gadget).
          opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', lang.hitch(this, function (key) {
            var data = opensocial.data.getDataContext().getDataSet(key);
            this.runExpired = new Date().getTime() > data.end;
            this.runid.resolve(data.id);
          }));
        } else {
          // No EE context, so ask the server if there is a current run.
          osapi.http.get({format: 'json', href: landos.getAPIUri('run')}).execute(lang.hitch(this, function (res) {
            var content = res.content;
            if (res.status === 200 && content.id) {
              if (content.id) {
                this.runid.resolve(content.id);
              }
            }
          }));
        }
      }));
      
      this.runid.then(lang.hitch(this, function(runid) {
        this.adminStatus.then(lang.hitch(this, function(isAdmin) {
          if (isAdmin) {
            require(['landos/RunSummary'], lang.hitch(this, function(RunSummary) {
              this.tabs.addChild(new RunSummary(runid));
            }));
          }
        }));
        this.showOrderForm(runid);
      }));
    },
    
    showOrderForm: function(runid) {
      html.set(this.runpara, 'Viewing run ' + runid + '.');
      require(['landos/CreateOrderPane'], lang.hitch(this, function(CreateOrderPane) {
        this.tabs.addChild(new CreateOrderPane({
          runid: runid,
          disabled: this.runExpired
        }));
      }));
    }
  });
});