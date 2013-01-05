define('landos/SubscribeButton', [
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/form/ToggleButton',
  'dijit/_Contained',
  'dojo/Deferred'
], function(lang, declare, ToggleButton, _Contained,  Deferred) {
  var undef;
  return declare(ToggleButton, {
    wire: undef,
    primed: false,
    
    startup: function() {
      this.inherited(arguments);
      this.getParent().watch('subscribed', lang.hitch(this, function(name, oldValue, value) {
        this.set({ checked: value, primed: true });
      }));
    },
    
    _setCheckedAttr: function(/*Boolean*/ value, /*Boolean?*/ priorityChange) {
      var parent = this.getParent();
      if (this.primed && (!this.wire || this.wire.isFulfilled())) {
        var inherited = this.getInherited(arguments);
        
        this.wire = new Deferred();
        this.wire.then(lang.hitch(this, function(result) {
          inherited.call(this, value, priorityChange);
        })).otherwise(lang.hitch(this, function(reason) {
          gadgets.error(reason);
        }));
        
        parent.viewer.then(lang.hitch(this, function(viewer) {
          var params = lang.mixin({ href: env.getAPIUri('subscribe') }, env.getRequestParams(viewer));
          osapi.http[value ? 'put' : 'delete']().execute(lang.hitch(this, function(result) {
            debugger;
          }));
        }));
      }
    }
  });
});