/*
 * @require /bodyContent/js/model/model.js
 */
var App = App || {};

App.BodyContent.todosView = Backbone .View.extend({

    className : "",//预留
    event:{},
    tagName :  "li",

    template:_.templateUrl("/bodyContent/tpls/todos.html"),

    render : function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }


});