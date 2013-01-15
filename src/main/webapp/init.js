

(function() {
  var url = /url=([^&]+)/.exec(window.location.href)[1];
  
  require({
    packages: [{
      name:'landos',
      location: url
    }]
  });
})();

require(['dojo/parser'], function(parser) {
  parser.parse();
});