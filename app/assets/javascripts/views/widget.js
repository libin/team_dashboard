(function ($, _, Backbone, views, models, collections) {
  "use strict";

  views.Widget = Backbone.View.extend({
    tagName: "div",
    className: "widget",

    events: {
      "click .widget-delete"   : "removeWidget"
    },

    initialize: function(options) {
      _.bindAll(this, "render", "updateWidget", "renderWidget", "updateWidgetDone", "updateWidgetFail");

      this.model.on('change', this.render);

      this.dashboard = options.dashboard;
      this.dialogEl = options.dialogEl;

      this.startPolling = true;
    },

    updateWidget: function() {
      this.clearTimeout();
      if (this.startPolling === false) return;

      this.$ajaxSpinner.show();
      this.widget.update().done(this.updateWidgetDone).fail(this.updateWidgetFail);
    },

    updateWidgetDone: function() {
      this.triggerTimeout();
      this.$ajaxSpinner.fadeOut('slow');
      // TODO clean up
      if (this.$content.find('.error')) this.renderWidget();
    },

    updateWidgetFail: function() {
      this.triggerTimeout();
      this.$ajaxSpinner.hide();
      this.showLoadingError();
    },

    clearTimeout: function() {
      if (this.timerId) clearTimeout(this.timerId);
    },

    triggerTimeout: function() {
      this.timerId = setTimeout(this.updateWidget, this.model.get('update_interval') * 10000);
    },

    showLoadingError: function() {
      this.$content.html("<div class='error'><p>Error loading datapoints...</p></div>");
    },

    toTitleCase: function(str) {
      return str.replace(/(?:^|\s)\w/g, function(match) {
          return match.toUpperCase();
      });
    },

    createWidget: function() {
      var className = this.toTitleCase(this.model.get('kind'));
      this.widget = new views.widgets[className]({ model: this.model });
      this.$content.html(this.widget.render().el);
    },

    renderWidget: function() {
      this.$content.html(this.widget.el);
    },

    render: function() {
      this.$el.html(JST['templates/widget/show']({ widget: this.model.toJSON() }));

      this.$el
        .addClass("portlet well well-small ui-widget ui-widget-content ui-corner-all")
        .attr("id", "widget-span-" + this.model.get('size') || 1)
        .attr("data-widget-id", this.model.get("id"));

      this.$ajaxSpinner = this.$('.ajax-spinner');
      this.$content = this.$('.portlet-content');

      this.createWidget();
      this.updateWidget();

      return this;
    },

    removeWidget: function(event) {
      this.close();

      var result = this.model.destroy();
    },

    onClose: function() {
      this.startPolling = false;
      this.model.off();
      this.clearTimeouts();
      this.widget.close();
    },

    clearTimeouts: function() {
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    }

  });

})($, _, Backbone, app.views, app.models, app.collections);
