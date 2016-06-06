/**
 * @require /resources/collection/resource.nav.es6
 */
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

        var id =App.ResourceArtifacts.Status.delRule ;

        //如果是新建元素，直接删除

        $.ajax({
            url:"http://bim.wanda-dev.cn/platform/mapping/rule/delete/" + id,
            type:"DELETE",
            success:function(response){
                 if(response.code==0){ //删除成功
                     $(".ruleDetail").hide();
                     App.ResourceArtifacts.Status.saved = true ;//保存状态va

                     App.ResourceArtifacts.PlanRules.each(function(item){
                         if(item.get("mappingCategory")[id] == id){
                             App.ResourceArtifacts.PlanRules.remove(item);
                         }
                     });

                     var _this = App.ResourceArtifacts.Status.presentPlan;

                     $(".artifactsContent .rules h2 .name").html(App.ResourceArtifacts.Status.rule.targetCode + "&nbsp;" +App.ResourceArtifacts.Status.rule.targetName);
                     $(".artifactsContent .rules h2 i").html( "("+_this.get("count") + ")");

                     App.Resources.ArtifactsAlertWindow.close();
                }
            },
            error:function(error){
                alert("错误类型"+ error.status +"，无法成功删除!");
                App.Resources.ArtifactsAlertWindow.close();
            }
        });
        App.ResourceArtifacts.Status.delRule = null;
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

