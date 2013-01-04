define('landos/env', [], function() {
  return {
    /**
     * Gets the api uri for the specified gadget-xml-relative path.
     */
    getAPIUri: function(api) {
      // UNSUPPORTED: We need a way to do this in the gadget spec.  This is Apache Shindig specific.
      var origin = gadgets.util.getUrlParameters()['url'];
      return origin.substring(0, origin.lastIndexOf('/') + 1) + api;
    }
  };
});