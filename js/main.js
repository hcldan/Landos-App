
require.config({
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    hogan: 'libs/hogan'
  }

});

require([
  'app'
], function(App){
  App.initialize();
});
