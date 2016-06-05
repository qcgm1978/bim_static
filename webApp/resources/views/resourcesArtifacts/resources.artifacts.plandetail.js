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
        //监听展开的模型是否被更改，如果更改，列出更改项，提示保存
        if(App.ResourceArtifacts.Status.presentPlan){
            this.listenTo(App.ResourceArtifacts.Status.presentPlan,"chang",this.getChangeAttr);    //previous    model.previous(attribute)
        }
    },

    //取得模型修改过的属性
    getChangeAttr:function(e){
        console.log(e);
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

        App.ResourceArtifacts.Status.presentPlan = null;
        App.ResourceArtifacts.Status.presentPlan = this.model;


        this. getRules();

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

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                App.ResourceArtifacts.PlanRules.reset();
                $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");



                if(response.data  &&  response.data.length){
                    $(".artifactsContent .rules ul").empty();
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }
            }
        });
    }
});