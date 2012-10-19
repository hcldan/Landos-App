
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {

  var IO = {
    makeRequest: function(url, requestType, data, callback, headers) {
      debugger;
      
      var urlRoot = "http://localhost:8080";
      
      // ensure that the url is properly formatted
      if (url[0] !== "/") {
        url = "/" + url;
      }
      
      url = urlRoot + url;
      
      $.ajax({
        "type": requestType,
        "url": url,
        "data": data,
        "success": callback,
        "dataType": "json"
      });
      
      //gadgets.io.makeRequest(url, cb, params);
    }
  };
  return IO;
});
