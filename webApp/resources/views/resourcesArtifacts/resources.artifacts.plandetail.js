/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plandetail.html"),

    events:{
        "click .item":"getPlanId"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change",this.render);
    },

    //取得规则列表
    getPlanId:function(){
         App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }
        this.toggleClass();
        this. getRules();

        App.ResourceArtifacts.Status.presentPlan = null;
        App.ResourceArtifacts.Status.presentPlan = this.model;
    },
//切换计划
    toggleClass:function(){
        $(".artifactsList li").removeClass("active");
        this.$el.addClass("active");
    },
//获取计划节点相关规则
    getRules:function() {
        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:App.ResourceArtifacts.Status.rule.targetCode,
                biz :App.ResourceArtifacts.Status.rule.biz,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.loading();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){

                $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");

                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.reset();
                    $(".artifactsContent .rules ul").empty();
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    $(".ruleContent ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
                }
            }
        });
    }
});