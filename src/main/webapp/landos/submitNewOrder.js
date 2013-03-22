define(['landos', 'dojo/io-query', 'dijit/Dialog'], function (landos, ioQuery, Dialog) {
  return function (run, values) {
    // Construct url
    var url = landos.getAPIUri('orders') + run.id + '?' + ioQuery.objectToQuery(values);
    // Submit put request
    osapi.http.put(lang.mixin({href: url}, landos.getRequestParams(id))).execute(function (res) {
      if (res.status === 200 && !res.content.error) {
        new Dialog({
          title: 'Success!',
          content: 'Created new order.'
        }).show();
      } else {
        new Dialog({
          title: 'Error!',
          content: 'There was an error creating your order. Please try again later.'
        }).show();
      }
    });
  };
});