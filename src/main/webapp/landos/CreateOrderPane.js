define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/_WidgetBase',
  'dojo/html',
  'dojo/Deferred',
  'dojo/on',
  'dijit/Dialog',
  // Template requirements
  'dijit/form/Form',
  'landos/FilteringSelect',
  'dijit/form/CurrencyTextBox',
  'dijit/form/TextBox',
  'dijit/form/NumberSpinner'
], function(require, landos, lang, declare, _TemplatedMixin, _WidgetsInTemplateMixin, _WidgetBase, html, Deferred, on, Dialog) {
  var OrderForm = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString:
      '<div>'
    +   '<p>Placing an order for run ${runid}.</p>'
    +   '<form data-dojo-type="dijit/form/Form" data-dojo-attach-point="form">'
    +     '<table>'
    +       '<tr>'
    +         '<td>'
    +           '<label for="item">Item:</label>'
    +         '</td>'
    +         '<td>'
    +           '<div id="item" data-dojo-type="landos/FilteringSelect" data-dojo-attach-point="item"></div>'
    +         '</td>'
    +       '</tr>'
    +       '<tr>'
    +         '<td>'
    +           '<label for="size">Size:</label>'
    +         '</td>'
    +         '<td>'
    +           '<input id="size" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-attach-point="size" />'
    +         '</td>'
    +       '</tr>'
    +       '<tr>'
    +         '<td>'
    +           '<label for="qty">Quantity:</label>'
    +         '</td>'
    +         '<td>'
    +           '<input id="qty" type="text" data-dojo-type="dijit/form/NumberSpinner" data-dojo-attach-point="qty" data-dojo-props="constraints: {min: 1}" value="1" />'
    +         '</td>'
    +       '</tr>'
    +       '<tr>'
    +         '<td>'
    +           '<label for="price">Price:</label>'
    +         '</td>'
    +         '<td>'
    +           '<input id="price" type="text" data-dojo-type="dijit/form/CurrencyTextBox" data-dojo-attach-point="price" required />'
    +         '</td>'
    +       '</tr>'
    +       '<tr>'
    +         '<td>'
    +           '<label for="comments">Comments:</label>'
    +         '</td>'
    +         '<td>'
    +           '<input id="comments" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-attach-point="comments" />'
    +         '</td>'
    +       '</tr>'
    +       '<tr>'
    +         '<td>'
    +           '<input type="submit" data-dojo-type="dijit/form/Button" data-dojo-attach-point="submit" label="Create" />'
    +         '</td>'
    +       '</tr>'
    +   '</form>'
    + '</div>',
    constructor: function (runid) {
      this.runid = runid;
    },
    postCreate: function () {
      this.inherited(arguments);
      on(this.submit, 'click', lang.hitch(this, function () {
        if (!this.form.isValid()) {
          this.form.validate();
          return false;
        }

        // Defer request until username is known (use viewer deferred in GadgetContainer)
        this.getParent().getParent().getParent().viewer.then(lang.hitch(this, function (id) {
          // Encode username
          var user = encodeURIComponent(id);
          // Get and correct price
          var price = +(this.price.get('value') * 100).toFixed(0);
          // Construct url
          var url = landos.getAPIUri('orders') + this.runid + '?user=' + user;
          url += '&item=' + encodeURIComponent(this.item.get('value'));
          url += '&price=' + price;
          if (this.size.get('value')) url += '&size=' + encodeURIComponent(this.size.get('value'));
          if (this.qty.get('value')) url += '&qty=' + encodeURIComponent(this.qty.get('value'));
          if (this.comments.get('value')) url += '&comments=' + encodeURIComponent(this.comments.get('value'));
          // Put to url
          console.log(url);
          osapi.http.put({format: 'json', href: url}).execute(function (res) {
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
        }));

        return false;
      }));
    }
  });

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString: '<div>Loading...</div>',
    title: 'Create Order',
    lDef: new Deferred(),
    constructor: function (runid) {
      var url = landos.getAPIUri('run') + runid;
      osapi.http.get({format: 'json', href: url}).execute(lang.hitch(this, function (res) {
        if (res.status === 200 && !res.content.error) {
          // Run exists
          this.lDef.resolve(runid);
        } else {
          // Run doesn't exist or other error
          this.lDef.resolve(false);
        }
      }));
    },
    startup: function () {
      this.inherited(arguments);
      this.lDef.then(lang.hitch(this, function (runid) {
        if (runid) {
          // Run exists, create order form
          var o = new OrderForm(runid);
          html.set(this.domNode, o.domNode);
        } else {
          // Run doesn't exist or there was another error
          html.set(this.domNode, 'Error: run doesn\'t exist or there was an error retrieving run details.');
        }
      }));
    }
  });
});