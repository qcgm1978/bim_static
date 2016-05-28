/**
 * @require /resources/collection/resource.nav.es6
 */
App.ResourcesNav.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planrule.html"),

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanRules,"add",this.addOne);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$("ul").append(newList.render().el);
    },
    //创建规则
    newPlanRule:function(){
        var _this = this;
        if(!App.ResourceArtifacts.Status.saved){
            //提示有没有保存现在的，重要
            return
        }
        if(!App.ResourceArtifacts.Status.presentPlan){
            //没有选择任何计划
            return
        }

        var model =  App.ResourceArtifacts.createPlanRules("1",App.ResourceArtifacts.Status.presentPlan.get("targetCode"),"新建映射规则","1");
        App.ResourceArtifacts.PlanRules.push(model);
        

        //向结尾添加一项新的规则
        //App.ResourceArtifacts.SavePlanRules  添加model  ，先有json模型
        //向现在的collection    App.ResourceArtifacts.PlanRules  末尾添加model
    }

});