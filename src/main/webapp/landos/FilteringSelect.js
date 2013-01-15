define([
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/form/FilteringSelect',
  'dijit/_Contained',
  'dojo/Deferred',
  'dojo/store/Memory'
], function(landos, lang, declare, FilteringSelect, _Contained,  Deferred, MemoryStore) {
  var undef;
  
  return declare([FilteringSelect, _Contained], {
    store: new MemoryStore({data: []}),
    labelAttr: 'food',
    searchAttr: 'food',
    required: true,
    
    /**
     * @Override dijit/form/FilteringSelect.isValid()
     */
    isValid: function(){
      return this.get('displayedValue') != "";
    },
    
    /**
     * @Override
     *   dijit/form/_SearchMixin._startSearch(text)
     *     dijit/form/_AutoCompleterMixin._startSearch(text) 
     */
    _startSearch: function(key) {
      //-- copy from _AutoCompleterMixin
      // summary:
      //    Starts a search for elements matching key (key=="" means to return all items),
      //    and calls _openResultList() when the search completes, to display the results.
      if(!this.dropDown){
        var popupId = this.id + "_popup",
          dropDownConstructor = lang.isString(this.dropDownClass) ?
            lang.getObject(this.dropDownClass, false) : this.dropDownClass;
        this.dropDown = new dropDownConstructor({
          onChange: lang.hitch(this, this._selectOption),
          id: popupId,
          dir: this.dir,
          textDir: this.textDir
        });
        this.focusNode.removeAttribute("aria-activedescendant");
        this.textbox.setAttribute("aria-owns",popupId); // associate popup with textbox
      }
      this._lastInput = key; // Store exactly what was entered by the user.
      //-- end copy from _AutoCompleterMixin
      
      this._abortQuery();
      
      this._lastQuery = key;
      if (key.length > 2) {
        this._queryDeferHandle = this.defer(lang.hitch(this, function(key) {
          var fetch = this._fetchHandle = new Deferred(),
              params = { format: 'json', href: landos.getAPIUri('items') + '/' + encodeURIComponent(key) },
              query = {};
          
          query[this.searchAttr] = key;
          osapi.http.get(params).execute(lang.hitch(this, function(result) {
            fetch[result.error || result.status != 200 ? 'reject' : 'resolve'](result);
          }));
          
          fetch.then(lang.hitch(this, function(results) {
            this._fetchHandle = null;
            var matches = results && results.content && results.content.matches || [];
            matches.nextPage = function() {};
            
            this.set('pageSize', matches.total = matches.length);
            this.set('store', new MemoryStore({data: matches}));
            this.onSearch(matches, query, { start: 0, count: matches.length });            
          })).otherwise(lang.hitch(this, function(error) {
            this._fetchHandle = null;
            
          }));
        }, key), this.searchDelay);
      }
    }
    
  });
});