"use strict";

App.Flow = App.Flow || {};

App.Flow.FlowDialog = Backbone.View.extend({

    className: "flowModal",

    template: _.templateUrl("/flow/tpls/flow.dialog.html"),

    events: {
        'click .dialogClose': 'close'
    },

    close: function close() {
        this.$el.remove();
    },
    render: function render(data) {
        this.$el.html(this.template(data));
        $('#flowContainer').append(this.$el);
        return this;
    }
});