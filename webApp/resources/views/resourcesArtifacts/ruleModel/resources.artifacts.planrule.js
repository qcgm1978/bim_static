/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planrule.html"),

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanRules,"add",this.addOne);
        this.listenTo(App.ResourceArtifacts.PlanRules,"remove",this.render);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$el.append(newList.render().el);   /*为什么换成this.$(".ruleContentRuleList ul")就会出错～～～～·*/
    },
    //创建规则
    newPlanRule:function(){
        var _this = this;
        var targetCode = App.ResourceArtifacts.Status.rule.targetCode;



        if(!targetCode){
            alert("请选择模块/质量标准");
            return;
        }//没有选择计划无法创建规则
        if( !App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            //查找未保存的元素并高亮提示变红
            return
        }

        //重置删除状态
        App.ResourceArtifacts.Status.delRule ="";


        if(!$(".ruleDetail").length){
            $(".artifactsContent .rules ul").html("");
        }
        //无数据或无更改，更改当前数据
        $(".ruleDetail:visible").hide();


        //创建规则
        var model =  App.ResourceArtifacts.createPlanRules();
        //加载底下规则
        var operatorData = App.Resources.dealStr2(model);//规则数据
        model.set({mappingCategory:operatorData},{silent:true});
        var container = new App.Resources.ArtifactsPlanRuleDetail({model:model});

        $(".rules>div").append(container.render().el).show();
        $(".rules>div>li:last-child .ruleDetail").show();
        App.ResourceArtifacts.Status.saved = false;
    }

});