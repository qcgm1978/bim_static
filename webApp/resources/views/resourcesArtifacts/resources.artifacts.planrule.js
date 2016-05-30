/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRule = Backbone.View.extend({

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

        if( !App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            //查找未保存的元素并高亮提示变红
            return
        }
        //无数据或无更改，更改当前数据
        $(".ruleDetail").empty().hide();
        //创建规则
        var model =  App.ResourceArtifacts.createPlanRules("1",App.ResourceArtifacts.Status.presentPlan.get("targetCode"),"新建映射规则","1");

        App.ResourceArtifacts.PlanRules.push(model);

        if(!App.ResourceArtifacts.Status.presentPlan){
            //没有选择任何计划
            App.ResourceArtifacts.Status.presentPlan = model;
        }
        $(".artifactsContent .rules ul li:last-child .ruleDetail").html( new App.Resources.ArtifactsPlanRuleDetailUnfold({model:model}).render().el).show();
        //保存状态
        App.ResourceArtifacts.Status.saved = false;
    }

});