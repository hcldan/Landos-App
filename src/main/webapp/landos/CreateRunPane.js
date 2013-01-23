define([
  'require',
  'landos',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'landos/base/LazyContainer',
  'dijit/Dialog',
  'dojo/dom-class',
  'dojo/on',
  'dojo/Deferred'
], function(require, landos, lang, declare, LazyContainer, Dialog, domClass, on, Deferred) {
  
  function mergeDatesToTimestamp(date, time) {
    var d = new Date();
    d.setMonth(date.getMonth());
    d.setDate(date.getDate());
    d.setYear(date.getFullYear());
    d.setHours(time.getHours());
    d.setMinutes(time.getMinutes());
    d.setSeconds(time.getSeconds());
    d.setMilliseconds(time.getMilliseconds());
    return d.getTime();
  }
  
  return declare(LazyContainer, {
    getRealTemplateString: function() {
      var def = new Deferred();
      require([  
        'dijit/form/Form',
        'dijit/form/DateTextBox',
        'dijit/form/TimeTextBox',
        'dijit/form/Button',
        'dijit/form/CheckBox'
      ], function() {
        def.resolve(
            '<div data-dojo-attach-point="containerNode">'
          +   '<form data-dojo-type="dijit/form/Form" data-dojo-attach-point="form">'
          +     '<table>'
          +       '<tr>'
          +         '<td><label for="startdate">Start on</label></td>'
          +         '<td>'
          +           '<input name="startdate" type="text" data-dojo-type="dijit/form/DateTextBox" data-dojo-attach-point="startdate" '
          +             'data-dojo-props="constraints: {formatLength: \'long\'}"required />'
          +         '</td>'
          +         '<td><label for="starttime">at</label></td>'
          +         '<td><input name="starttime" type="text" data-dojo-type="dijit/form/TimeTextBox" data-dojo-attach-point="starttime" required /></td>'
          +       '</tr>'
          +       '<tr>'
          +         '<td><label for="enddate">End on</label></td>'
          +         '<td>'
          +           '<input name="enddate" type="text" data-dojo-type="dijit/form/DateTextBox" data-dojo-attach-point="enddate" '
          +             'data-dojo-props="constraints: {formatLength: \'long\'}"required />'
          +         '</td>'
          +         '<td><label for="endtime">at</label></td>'
          +         '<td><input name="endtime" type="text" data-dojo-type="dijit/form/TimeTextBox" data-dojo-attach-point="endtime" required /></td>'
          +       '</tr>'
          +       '<tr>'
          +         '<td><input name="test" type="checkbox" data-dojo-type="dijit/form/CheckBox" data-dojo-attach-point="test" /><label for="test">Test?</label></td>'
          +         '<td><input type="submit" data-dojo-type="dijit/form/Button" data-dojo-attach-point="submit" label="Create" /></td>'
          +       '</tr>'
          +     '</table>'
          +   '</form>'
          + '</div>'      
        );
      });
      return def.promise;
    },
    
    startup: function () {
      this.inherited(arguments);
      
      if (this._loaded) {
        // Set default values
        var date = new Date();
        this.startdate.set('value', date);
        this.starttime.set('value', date);
        date.setHours(date.getHours() + 2);
        this.enddate.set('value', date);
        this.endtime.set('value', date);
        // Attach event handler
        on(this.submit, 'click', lang.hitch(this, '_onSubmit'));
      }
    },
    
    _onSubmit: function (e) {
      if (!this.form.isValid()) {
        this.form.validate();
      } else {
        var start = mergeDatesToTimestamp(this.startdate.value, this.starttime.value);
        var end = mergeDatesToTimestamp(this.enddate.value, this.endtime.value);
        if (end <= start) {
          new Dialog({
            title: 'Warning!',
            content: 'Start date/time must come before end date/time!'
          }).show();
        } else {
          var url = landos.getAPIUri('run') + '/' + start + '/' + end + '/' + (this.test.checked ? '1' : '0');
          var req = osapi.http.put({format: 'json', href: url});
          req.execute(function (res) {
            var c = res.content;
            if (res.status === 200 && c && !c.error) {
              new Dialog({
                title: 'Success!',
                content: 'Created new run with id ' + c.id + '.'
              }).show();
            } else {
              new Dialog({
                title: 'Error!',
                content: c.error || 'HTTP ' + res.status
              }).show();
            }
          });
        }
      }
      return false;
    }
  });
});