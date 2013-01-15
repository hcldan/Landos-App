define([
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/form/FilteringSelect',
  'dijit/_Contained',
  'dojo/Deferred'
], function(landos, lang, declare, FilteringSelect, _Contained,  Deferred) {
  var undef;
  
  return declare([FilteringSelect, _Contained], {
    store: {},
    
    searchDelay: 300,
    
    /**
     * @Override dijit/form/_SearchMixin._startSearch(text)
     */
    _startSearch: function(text) {
      this._abortQuery();
      
      this._lastQuery = text;
      if (text.length > 2) {
        this._queryDeferHandle = this.defer(lang.hitch(this, function(text) {
          var fetch = this._fetchHandle = new Deferred();
          
          var params = { format: 'json', href: landos.getAPIUri('items') + '/' + encodeURIComponent(text) };
          osapi.http.get(params).execute(lang.hitch(this, function(result) {
            fetch[result.error || result.status != 200 ? 'reject' : 'resolve'](result);
          }));
          
          fetch.then(lang.hitch(this, function(results) {
            this._fetchHandle = null;
            
          })).otherwise(lang.hitch(this, function(error) {
            this._fetchHandle = null;
            
          }));
        }, text), this.searchDelay);
      }
    }
    
  });
});