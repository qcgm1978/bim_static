/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    el:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plandetail.html"),

    events:{
        "click el":"getRuleList"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){},
    //取得规则列表
    getRuleList:function(){
        var  rules = this.model.get("ruleList");
    }
});