/*
 * @require /bodyContent/js/view/todos.js
 */
App.BodyContent.todosList = Backbone.View.extend({

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        this.$el.find(".article").html("<span class='noDataTip'>暂无内容</span>")
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