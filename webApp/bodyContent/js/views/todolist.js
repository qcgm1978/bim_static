/*
 * @require /bodyContent/js/view/todos.js
 */
var App = App || {};
App.BodyContent.todosList = Backbone.View.extend({

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        this.listenTo(App.BodyContent.control.todoCollection,"add",this.addOne);
        this.render();
    },
    //数据加载
    addOne:function(item){
        var newView = new App.BodyContent.todosView({model : item});
        this.$el.append(newView.render().el);
    }
});