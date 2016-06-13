/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"ul",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planrule.html"),

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.resetTitle,this);
        Backbone.on("mappingRuleNoContent",this.mappingRuleNoContent,this);
    },

    mappingRuleNoContent:function(){
        this.$el.html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$el.append(newList.render().el);
    },

    resetTitle:function(){
        var _this = this;
        this.collection = App.ResourceArtifacts.PlanRules;
        this.$el.html("");
        if(this.collection.length == 0){
            this.$(".ruleContentRuleList ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
        }else{
            this.collection.each(function(item){
                _this.addOne(item);
            })
        }
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