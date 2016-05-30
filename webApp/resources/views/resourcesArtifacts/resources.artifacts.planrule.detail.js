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
            }else if(App.ResourceArtifacts.Status.presentPlan == this.model){
                this.tabRule();
                return ;
            }
        }
        //无数据或无更改，更改当前数据
        $(".ruleDetail").empty().hide();
        this.reset();
        //存储model
        App.ResourceArtifacts.Status.presentPlan = this.model;
        this.$(".ruleDetail").html( new App.Resources.ArtifactsPlanRuleDetailUnfold({model:App.ResourceArtifacts.Status.presentPlan}).render().el);
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
        if(App.ResourceArtifacts.Status.presentPlan){App.ResourceArtifacts.Status.presentPlan=null;}
    }
});