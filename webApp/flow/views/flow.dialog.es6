App.Flow = App.Flow || {};

App.Flow.FlowDialog = Backbone.View.extend({

    className: "flowModal",

    template: _.templateUrl("/flow/tpls/flow.dialog.html"),

    events: {
        'click .close': 'close'
    },

    close(){
        this.$el.remove();
    },
    render(data){
        this.$el.html(this.template(data));
        $('#flowContainer').append(this.$el);
        return this;
    }

});
