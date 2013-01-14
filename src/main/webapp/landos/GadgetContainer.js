require({cache:{'landos/GadgetContainer': function() { define([
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'landos/env',
  'dojo/Deferred',
  'landos/SubscribeButton',
  'landos/FilteringSelect',
  'landos/LoadingPanel'
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
    +   '<h1>The Lando\'s App</h1>'
    +   '<button class="subscribe" data-dojo-type="landos/SubscribeButton">Sign me up!</button>'
    +   '<div data-dojo-type="landos/FilteringSelect" data-dojo-attach-point="item"></div>'
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
              href: env.getAPIUri('subscribe')  + '/' + encodeURIComponent(viewer)
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
})}}});