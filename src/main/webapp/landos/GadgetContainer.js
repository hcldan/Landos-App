define([
  // Used in callback:
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/Deferred',
  'dojo/html',
  'landos/CreateOrderPane',
  // Required for template parsing
  'landos/SubscribeButton',
  'landos/CreateRunPane',
  'landos/LoadingPanel',
  'dijit/layout/TabContainer',
  'dijit/layout/ContentPane'
], function(landos, lang, declare, _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, Deferred, html, CreateOrderPane) {
  var undef;
  return declare([_WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // Template bindings
    /** {landos/LoadingPanel} loading panel widget */
    loading: undef,
    /** {Deferred<string>} deferred containing the gadget viewer */
    viewer: new Deferred(),
    runid: new Deferred(),
    
    // Other variables
    /** {boolean} Subscription status */
    subscribed: undef,
    
    templateString:
      '<div class="container" data-dojo-attach-point="containerNode">'
    +   '<div id="tabs" data-dojo-type="dijit/layout/TabContainer" data-dojo-attach-point="tabs">'
    +     '<div id="tab-welcome" data-dojo-type="dijit/layout/ContentPane" title="Welcome">'
    +       '<p>Welcome to the Lando\'s App!</p>'
    +       '<p data-dojo-attach-point="runpara"></p>'
    +     '</div>'
    +     '<div id="run-creation" data-dojo-type="landos/CreateRunPane" title="Create Run"></div>'
    +   '</div>'
    +   '<h1>The Lando\'s App</h1>'
    +   '<button class="subscribe" data-dojo-type="landos/SubscribeButton">Sign me up!</button>'
    +   '<div data-dojo-type="landos/LoadingPanel" data-dojo-attach-point="loading"></div>'
    + '</div>',
    
    startup: function() {
      this.inherited(arguments);
      this.loading.show();
      
      var onData = new Deferred();
      onData.then(lang.hitch(this, function(result) {
        this.set('subscribed', result.subscribe.content.subscribed);
        this.loading.hide();
      })).otherwise(lang.hitch(this, function(reason) {
        gadgets.error(reason);
      }));
      
      this.viewer.then(lang.hitch(this, function(viewer) {
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
        osapi.people.getViewer().execute(lang.hitch(this, function(viewer) {
          if (viewer && viewer.id) {
            this.viewer.resolve(viewer.id);
          } else {
            this.viewer.reject(viewer);
          }
        }));
        
        opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', lang.hitch(this, function (key) {
          if (!this.runid.isResolved()) {
            this.runid.resolve(opensocial.data.getDataContext().getDataSet(key).runid);
          }
        }));
        
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
    },
    
    showOrderForm: function(runid) {
      html.set(this.runpara, 'Managing run ' + runid + '.');
      this.tabs.addChild(new CreateOrderPane(runid));
    }
  });
});