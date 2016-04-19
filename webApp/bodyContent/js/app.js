/*
 * @require /bodyContent/js/model/model.js
 */
var App = App || {};
App.BodyContent.App=Backbone.View.extend({

    el:$("#contains"),

    template:_.templateUrl("/bodyContent/tpls/bodyContent.html",true),

    render:function(){
        this.$el.html(this.template);
        return this;
    }
});