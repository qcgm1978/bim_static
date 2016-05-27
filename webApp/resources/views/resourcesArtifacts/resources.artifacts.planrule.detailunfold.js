/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailUnfold = Backbone.View.extend({

    tagName:"div",
    className:"ruleDetail",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailunfold.html"),

    events:{
        "click .tabRule":"tabRule",
        "click .addNewRule":"addNewRule",
        "click .deleteRule":"deleteRule",
        "click .save":"save",
        "click .choose":"choose"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
    },
    //选择分类编码
    choose:function(){

    },
    //切换规则
    tabRule:function(){

    },
    //增加新规则
    addNewRule:function(){

    },
    //保存
    save:function(){

    },
    //删除计划中的规则
    deletePlanRule:function(){

    },
    //删除规则
    deleteRule:function(){

    },
    //联想模块
    legend:function(){

    },
    //校验模块
    check:function(){

    },
    //提示窗
    window:function(){

    },
    //选择分类编码
    chooseWindow:function(){

    }
});