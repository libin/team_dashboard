(function ($, _, Backbone, views, models, collections) {
  "use strict";

  views.WidgetEditors.Number = Backbone.View.extend({

    events: {
      "change select#source1" : "sourceChanged",
      "change select#source2" : "sourceChanged",
      "change select#source3" : "sourceChanged"
    },

    initialize: function() {
      _.bindAll(this, "sourceChanged", "render");
    },

    validate: function() {
      return this.form.validate();
    },

    sourceChanged: function(event) {
      var value  = this.$(event.target).val(),
          id     = this.$(event.target).attr("id"),
          number = id.charAt(id.length-1),
          el     = this.$(".field-http_proxy_url"+number);
      if (value === "http_proxy") {
        el.slideDown();
      } else {
        el.slideUp();
      }
    },

    render: function() {
      this.form = new Backbone.Form({
        data  : this.model.toJSON(),
        schema: this.getSchema()
      });
      this.$el.html(this.form.render().el);

      this.updateHttpProxyFieldVisibility(1);
      this.updateHttpProxyFieldVisibility(2);
      this.updateHttpProxyFieldVisibility(3);

      return this;
    },

    updateHttpProxyFieldVisibility: function(number) {
      if (this.getSourceEl(number).val() === "http_proxy") {
        this.getHttpProxyFieldEl(number).show();
      } else {
        this.getHttpProxyFieldEl(number).hide();
      }
    },

    getSourceEl: function(number) {
      return this.$("select#source"+number);
    },

    getHttpProxyFieldEl: function(number) {
      return this.$(".field-http_proxy_url"+number);
    },

    getValue: function() {
      return this.form.getValue();
    },

    getSources: function() {
      var sources = $.Sources.getNumber();
      sources.unshift("");
      return sources;
    },

    getUpdateIntervalOptions: function() {
      return [
        { val: 10, label: '10 sec' },
        { val: 600, label: '1 min' },
        { val: 6000, label: '10 min' },
        { val: 36000, label: '1 hour' }
      ];
    },

    getSchema: function() {
      var that = this;
      var err = { type: 'required', message: 'Required' };

      var sourceFormBuilder = function(number) {
        var result = {};
        result["source" + number] = {
          title: "Source " + number,
          type: 'Select',
          options: that.getSources(),
          validators: [function requiredSource(value, formValues) {
            if (number === 1 && value.length === 0 ) { return err; }
          }]
        };
        result["http_proxy_url" + number] = {
          title: "Proxy URL " + number,
          type: "Text",
          validators: [ function checkHttpProxyUrl(value, formValues) {
            if (formValues["source" + number] === "http_proxy" && value.length === 0) { return err; }
          }]
        };
        result["label" + number] = { title: "Default Label " + number, type: 'Text' };
        return result;
      };

      var result = {
        name: { title: "Text", validators: ["required"] },
        update_interval:  {
          title: 'Update Interval',
          type: 'Select',
          options: this.getUpdateIntervalOptions()
        }
      };

      result = _.extend(result, sourceFormBuilder(1));
      result = _.extend(result, sourceFormBuilder(2));
      result = _.extend(result, sourceFormBuilder(3));
      return result;
    }

  });
})($, _, Backbone, app.views, app.models, app.collections);