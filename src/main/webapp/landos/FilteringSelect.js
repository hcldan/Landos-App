define('landos/FilteringSelect', [
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/form/FilteringSelect',
  'dijit/_Contained',
  'dojo/Deferred',
  'landos/env'
], function(lang, declare, FilteringSelect, _Contained,  Deferred, env) {
  var undef;
  
  return declare([FilteringSelect, _Contained], {
    store: {},
    
    /**
     * @Override dijit/form/_SearchMixin._startSearch(text)
     */
    _startSearch: function(text) {
      this._abortQuery();
      
      this._lastQuery = text;
      this._queryDeferHandle = this.defer(lang.hitch(this, function(text) {
        var fetch = this._fetchHandle = new Deferred();
        
        
        
        fetch.then(lang.hitch(this, function(results) {
          this._fetchHandle = null;
          
        })).otherwise(lang.hitch(this, function(error) {
          this._fetchHandle = null;
          
        }));
      }, text), this.searchDelay);
    }
    
  });
});