/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({
    el:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plan.rules.html"),

    events:{
        "click el":"getRuleList"
    },

    render:function() {
        this.$el.html(this.template());
        return this;
    },

    initialize:function(){
        //this.listenTo(collection,"add",this.addOne);
    },
    //取得规则列表
    getRuleList:function(){
        var  rules = this.model.get("ruleList");

    }
});