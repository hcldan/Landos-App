
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {

  var formatUrl = function(url) {
    //var urlRoot = "http://kargath.notesdev.ibm.com";
    var urlRoot = "http://localhost:8080";

    // ensure that the url is properly formatted
    if (url[0] !== "/") {
      url = "/" + url;
    }

    return urlRoot + url;
  };

  var regularIo = {
    makeRequest: function(url, type, data, callback, headers) {
      $.ajax({
        "type": type,
        "url": formatUrl(url),
        "contentType" : "application/json",
        "data": data,
        "success": callback,
        "dataType": "json"
      });
    }
  };

  var gadgetIo = {
    makeRequest: function(url, type, data, callback, headers) {
      var requestType = gadgets.io.MethodType.GET;

      if (type === "GET") {
        requestType = gadgets.io.MethodType.GET;
      } else if (type === "POST") {
        requestType = gadgets.io.MethodType.POST;
      } else if (type === "PUT") {
        requestType = gadgets.io.MethodType.PUT;
      } else if (type === "DELETE") {
        requestType = gadgets.io.MethodType.DELETE;
      }

      var params = {};
      params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      params[gadgets.io.RequestParameters.HEADERS] = headers;
      params[gadgets.io.RequestParameters.METHOD] = requestType;
      params[gadgets.io.RequestParameters.POST_DATA] = data;
      params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;

      var cb = function(data) {
        var rData = data.data;
        var successText;
        if (!rData) {
          rData = [];
        }

        if (data.rc === 200 || data.rc === 201) {
          successText = "success";
        } else {
          successText = "error";
        }

        callback(rData, successText);
      };

      gadgets.io.makeRequest(formatUrl(url), cb, params);
      } 
    };

    if (typeof gadgets !== 'undefined') {
      return gadgetIo;
    } else {
      return regularIo;
    }
  });
  