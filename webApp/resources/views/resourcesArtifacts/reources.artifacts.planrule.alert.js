/*
 * @require  /services/views/auth/member/services.member.ozDetail.js
 * */
App.Resources.ArtifactsPlanRuleAlert = Backbone.View.extend({

    tagName :'div',
    className:"resourcesAlert",

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planrule.alert.html"),

    events:{
        "click #resourcesSure":"sure",
        "click #resourcesCancel":"cancel",
        "click #resourcesClose":"close"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(models){

    },
    //确定
    sure : function(){

        $.ajax({
            url:"http://bim.wanda-dev.cn/platform/mapping/rule/delete/" +"id",
            type:"DELETE",
            success:function(response){

                 if(response.code==0){ //删除成功
                     this.$el.closest(".ruleDetail").hide().empty();
                     App.ResourceArtifacts.Status.saved = true ;//保存状态
                     App.ResourceArtifacts.Status.presentPlan= null; //重置模型
                     App.Resources.ArtifactsAlertWindow.close();
                }
            },
            error:function(error){
                alert("错误类型"+ error.status +"，无法成功删除!");
                App.Resources.ArtifactsAlertWindow.close();
            }
        });
    },
        //取消
    cancel:function(){
        App.Resources.ArtifactsAlertWindow.close();
    },
    //关闭
    close:function(){
        App.Resources.ArtifactsAlertWindow.close();
    }
});

