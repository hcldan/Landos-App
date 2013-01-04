define('landos/GadgetContainer', [
  'require',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'landos/env'
], function(require, lang, declare, _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, env) {
  var undef;
  return declare([_WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // Template bindings
    /** {landos/LoadingPanel} loading panel widget */
    loading: undef,
    
    /** {boolean} Subscription status */
    subscribed: false,
    
    templateString:
      '<div class="container" data-dojo-attach-point="containerNode">'
    +  '<div data-dojo-type="landos/LoadingPanel" data-dojo-attach-point="loading"></div>'
    + '</div>',
    
    startup: function() {
      this.inherited(arguments);
      this.loading.show();

      this.subscribed = new Deferred();
      var onData = new Deferred();
      onData.then(lang.hitch(this, function(result) {
        this.set('subscribed', result.subscribe.subscribed);
        this.loading.hide();
      })).otherwise(lang.hitch(this, function(reason) {
        gadgets.error(reason);
      }));
      
      gadgets.util.registerOnLoadHandler(function() {
        osapi.people.getViewer().execute(function(viewer) {
          if (viewer && viewer.id) {
            var batch = osapi.newBatch();
            batch.add('data', osapi.http.get({
              href: env.getAPIUri('data'),
              format: 'json',
              headers: {
                'OPENSOCIAL-ID': [viewer.id]
              }
            }));
            batch.add('subscribe', osapi.http.get({
              href: env.getAPIUri('subscribe'),
              format: 'json',
              headers: {
                'OPENSOCIAL-ID': [viewer.id]
              }
            }))
            batch.execute(function(results) {
              for (var key in results) {
                if (results.hasOwnProperty(key)) {
                  var result = results[key];
                  if (result.error || result.status != 200) {
                    return onData.reject(results);
                  }
                }
              }
              onData.resolve(results);
            }); 
          } else {
            onData.reject(viewer);
          }
        });
      });
    }
  });
});