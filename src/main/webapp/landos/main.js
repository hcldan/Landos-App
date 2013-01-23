define(['require', 'dojo/Deferred'], function(require, Deferred) {
  var viewer;
  
  return {
    /**
     * Gets the api uri for the specified gadget-xml-relative path.
     */
    getAPIUri: function(api) {
      return require.toUrl('api/' + api) + '/';
    },
    
    /**
     * Get standard request params for the given user.
     */
    getRequestParams: function(user) {
      return {
        format: 'json',
        headers: {
          'OPENSOCIAL-ID': [user]
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
    },
    
    /**
     * @returns {dojo/promise/Promise} for the viewer
     */
    getViewer: function() {
      if (!viewer) {
        viewer = new Deferred();
        
        gadgets.util.registerOnLoadHandler(function() {
          osapi.people.getViewer().execute(function(resp) {
            if (resp && resp.id) {
              viewer.resolve(resp.id);
            } else {
              viewer.reject(resp);
            }
          })
        });
      }
      
      return viewer.promise;
    }
  };
});