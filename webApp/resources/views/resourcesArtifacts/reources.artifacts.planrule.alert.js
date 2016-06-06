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

        var id = App.ResourceArtifacts.Status.delRule;

        //新建规则，直接删除
        if(!id){
            //直接删除末尾内容
            $(".ruleContent>ul>li").last().remove();
            App.Resources.ArtifactsAlertWindow.close();
            App.ResourceArtifacts.Status.saved = true;
            return
        }

        //非新建
        $.ajax({
            url:"http://bim.wanda-dev.cn/platform/mapping/rule/delete/" + id,
            type:"DELETE",
            success:function(response){
                 if(response.code==0){ //删除成功
                     $(".ruleDetail").hide();
                     App.ResourceArtifacts.Status.saved = true ;//保存状态

                     var pre = App.ResourceArtifacts.PlanRules.filter(function(item){
                         return item.get("mappingCategory")[id] == id;
                     });

                     App.ResourceArtifacts.PlanRules.remove(pre);

                     _.each($(".ruleTitle"),function(item){
                         if(parseInt($(item).attr("data-id")) == parseInt(id)){
                             $(item).closest("li").remove();
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

