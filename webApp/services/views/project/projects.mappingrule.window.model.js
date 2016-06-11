/*
 * @require  /services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.MappingRuleWindow = Backbone.View.extend({

    tagName :'div',
    className:"projectMappingRuleWindow",

    template:_.templateUrl("/services/tpls/project/projects.mappingrule.window.model.html"),

    events:{
        "click .windowSubmit":"sure"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.Services.ProjectCollection.ProjectMappingRuleModelCollection,"add",this.addOne);
    },

    //数据加载
    addOne:function(model){
        console.log(model);
        var newView = new App.Services.MappingRuleWindowDetail({model:model});
        this.$(".projectMappingModelList ul").append(newView.render().el);
        App.Comm.initScroll(this.$el.find(".projectMappingRuleWindow"),"y");
    },


    //确定
    sure : function(){
        var _this = this,
            data,
            templateId  = $(".item li.active").find(".item").data("id");
        //projectId  没给呢

        data = {
            URLtype:"modifyProjectMappingRule",
            data:{
                projectId:projectId,
                templateId:templateId
            }
        };

        App.Comm.ajax(data,function(response){
            if(response.code == 0){
                //修改成功
                App.Services.maskWindow.close();
            }else{

            }
        });

    },
        //取消
    cancel:function(){
        App.Services.maskWindow.close();
    },
    //关闭
    close:function(){
        App.Services.maskWindow.close();
    }
});

