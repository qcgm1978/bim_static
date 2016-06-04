/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetail.html"),

    events:{
        "click .desc":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},

    getDetail:function(){
        if(App.ResourceArtifacts.Status.presentPlan){//有数据
            if( !App.ResourceArtifacts.Status.saved){
                if(App.ResourceArtifacts.openRule == this.model){  //当前
                    this.tabRule();
                    return ;
                }else{
                    alert("您还有没保存的");
                    //查找未保存的元素并高亮提示变红
                    return;
                }
            }else if(App.ResourceArtifacts.Status.presentRule == this.model){
                this.tabRule();
                return ;
            }
        }
        //无数据或无更改，更改当前数据
        $(".ruleDetail").empty().hide();
        this.reset();
        //存储model
        App.ResourceArtifacts.Status.presentRule = this.model;
        var rule = new App.Resources.ArtifactsPlanRuleDetailUnfold({model:App.ResourceArtifacts.Status.presentRule});
        var operator = new App.Resources.ArtifactsPlanRuleDetailOperator().render().el;
        this.$(".ruleDetail").html(rule.render().el);
        rule.$(".mapRule").html(operator);//规则列表
        var operatorData = App.Resources.dealStr(App.ResourceArtifacts.Status.presentRule);//规则数据

        App.ResourceArtifacts.operator.reset();
        App.ResourceArtifacts.operator.add(operatorData);
        this.$(".ruleDetail").show();
    },
    //开合状态
    tabRule:function(){
        if(this.$(".ruleDetail:hidden").length){    //未显示
            this.$(".ruleDetail").show();
        }else{
            this.$(".ruleDetail").hide();
        }
    },

    reset:function(){//重置模型
        if(App.ResourceArtifacts.Status.presentRule){App.ResourceArtifacts.Status.presentRule=null;}
    }
});