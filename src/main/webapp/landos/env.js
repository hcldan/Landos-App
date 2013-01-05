define('landos/env', [], function() {
  return {
    /**
     * Gets the api uri for the specified gadget-xml-relative path.
     */
    getAPIUri: function(api) {
      // UNSUPPORTED: We need a way to do this in the gadget spec.  This is Apache Shindig specific.
      var origin = gadgets.util.getUrlParameters()['url'];
      return origin.substring(0, origin.lastIndexOf('/') + 1) + api;
    },
    
    /**
     * Get standard request params for the given user.
     */
    getRequestParams: function(user) {
      return {
        format: 'json',
        headers: {
          'OPENSOCIAL-ID': [viewer.id]
        }
      };
    },
    
    /**
     * Translate and process an osapi batch request and wire it to the supplied deferred
     */
    processOSAPIBatchResponse: function(request, deferred) {
      request.execute(function(results) {
        // Deal with occasional wonkey batch response format...  
        if (results.length) {
          // TODO: Report this to shindig if it can be easily reproduced.
          var arr = results;
          results = {};
          for (var i = 0; i < arr.length; i++) {
            var result = arr[i]; 
            results[result.id] = result;
          }
        }
        for (var key in results) {
          if (results.hasOwnProperty(key)) {
            var result = results[key];
            if (result.error || result.status != 200) {
              return deferred.reject(results);
            }
          }
        }
        deferred.resolve(results);
      }); 
    }
  };
});