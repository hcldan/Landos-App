define('landos/GadgetContainer', [
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'landos/env',
  'dojo/Deferred',
  'dijit/form/ToggleButton'
], function(lang, declare, _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, env, Deferred) {
  var undef;
  return declare([_WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // Template bindings
    /** {landos/LoadingPanel} loading panel widget */
    loading: undef,
    /** {Deferred<string>} deferred containing the gadget viewer */
    viewer: new Deferred(),
    
    // Other variables
    /** {boolean} Subscription status */
    subscribed: undef,
    
    templateString:
      '<div class="container" data-dojo-attach-point="containerNode">'
    +   '<button data-dojo-type="landos/SubscribeButton" data-dojo-props="iconClass:\'dijitCheckBoxIcon\', checked: false">Let me know!</button>'
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
        var params = env.getRequestParams(viewer),
          batch = osapi.newBatch()
            .add('data', osapi.http.get(lang.mixin({ 
              href: env.getAPIUri('data') 
            }, params)))
            .add('subscribe', osapi.http.get(lang.mixin({
              href: env.getAPIUri('subscribe') 
            }, params)));
    
        env.processOSAPIBatchResponse(batch, onData);
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
      }));
    }
  });
});