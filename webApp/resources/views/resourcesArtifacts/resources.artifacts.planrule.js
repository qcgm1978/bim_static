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
        this.listenTo(App.ResourceArtifacts.PlanRules,"change",this.render);
        this.listenTo(App.ResourceArtifacts.PlanRules,"remove",this.render);
        //获取分类编码

        var cdata = {
            URLtype:"fetchArtifactsCategoryRule",
            data:{}
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },


    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$("ul").append(newList.render().el);
    },




    //创建规则
    newPlanRule:function(){
        var _this = this;
        var targetCode = App.ResourceArtifacts.Status.rule.targetCode;
        if(!targetCode){
            alert("您还没有选择模块/质量标准");
            return;
        }//没有选择计划无法创建规则

        if( !App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            //查找未保存的元素并高亮提示变红
            return
        }

        if(!$(".ruleDetail").length){
            $(".artifactsContent .rules ul").html("");
        }
        //无数据或无更改，更改当前数据
        $(".ruleDetail:visible").hide();
        //创建规则

        var model =  App.ResourceArtifacts.createPlanRules();
        App.ResourceArtifacts.PlanRules.push(model);

        var container = new App.Resources.ArtifactsPlanRuleDetailUnfold({model:model});
        $(".artifactsContent .rules ul li:last-child .ruleDetail").html(container.render().el).show();

        //加载底下规则
        var newRuleView = new App.Resources.ArtifactsPlanRuleDetailOperator();
        container.$(".mapRule").html(newRuleView.render().el);

        var list = App.Resources.dealStr(model);
        App.ResourceArtifacts.operator.add(list);
    }
});