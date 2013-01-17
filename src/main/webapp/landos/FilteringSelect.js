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
    required: true,
    queryExpr: '*${0}*',
    autoComplete: false,
    labelType: 'html',
    
    /**
     * @Override dijit/form/FilteringSelect.isValid()
     */
    isValid: function(){
      return this.get('displayedValue') != "";
    },
    
    /**
     * @Override dijit/form/_AutoCompleterMixin._autoCompleteText()
     */
    _autoCompleteText: function(text) {
      this.inherited(arguments, [this.item.id]);
    }
    
    startup: function() {
      this.inherited(arguments);
      var params = { format: 'json', href: landos.getAPIUri('items') };
  
      osapi.http.get(params).execute(lang.hitch(this, function(result) {
        if (result.status && result.status == 200) {
          var items = result && result.content && result.content.matches || [];
          for(var i = 0; i < items.length; i++) {
            var item = items[i];
            this.store.add({
              id: item.food,
              name: item.food + ' <i>(' + item.category + ')</i>'
            });
          }
        }
      }));
    }
  });
});
