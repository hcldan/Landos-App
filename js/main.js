
require.config({
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    hogan: 'libs/hogan',
    io: 'libs/io'
  }

});

require([
  'app'
], function(App){
  App.initialize();
});
