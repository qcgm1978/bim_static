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
        var  code = this.model.get("code");
        if(!code){
            //判断是否为新建规则，新建规则如何处理？
            return;
        }

        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }

        $(".artifactsContent .rules ul").empty();

        this.toggleClass();
        this. getRules();

        //保存计划规则
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
        var code = this.model.get("code");
        if(!App.ResourceArtifacts.Status.saved){
            //提示有没有保存现在的，重要
            return
        }
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                App.ResourceArtifacts.PlanRules.reset();
                if(response.data  &&  response.data.length){
                    $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                    $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }
            }
        });
    }
});