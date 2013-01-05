define('landos/SubscribeButton', [
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/form/ToggleButton',
  'dijit/_Contained',
  'dojo/Deferred',
  'landos/env',
], function(lang, declare, ToggleButton, _Contained,  Deferred, env) {
  var undef;
  return declare(ToggleButton, {
    disabled: true,
    iconClass: 'dijitCheckBoxIcon',
    checked: false,
    
    wire: undef,
    
    startup: function() {
      this.inherited(arguments);
      this.getParent().watch('subscribed', lang.hitch(this, function(name, oldValue, value) {
        this.set({ checked: value, disabled: false });
      }));
    },
    
    _onClick: function(/*Event*/ evt) {
      var parent = this.getParent();
      if (!this.disabled && (!this.wire || this.wire.isFulfilled())) {
        var inherited = this.getInherited(arguments);
        
        this.wire = new Deferred();
        this.wire.then(lang.hitch(this, function(result) {
          inherited.call(this, evt);
        })).otherwise(function(reason) {
          gadgets.error(reason);
        });
        
        parent.viewer.then(lang.hitch(this, function(viewer) {
          var params = lang.mixin({ href: env.getAPIUri('subscribe') + '/' + encodeURIComponent(viewer) }, env.getRequestParams(viewer));
          osapi.http[this.checked ? 'delete' : 'put'](params).execute(lang.hitch(this, function(result) {
            if (result.error || result.stats != 201) {
              this.wire.reject(result);
            } else {
              debugger;
              this.wire.reject(result); // for now
            }
          }));
        }));
      }
    }
  });
});