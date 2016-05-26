/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",
    className : "planItem",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plandetail.html"),

    events:{
        "click .planItem":"getRuleList"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){},
    //取得规则列表
    getRuleList:function(){
        var  planId = this.model.get("id");
        if(!planId){return;}

    },

    getRules:function(planId) {
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                planId:planId
            }
        };
        App.Comm.ajax(pdata,function(response){
           if(response.code == 0 ){
               if(response.data  &&  response.data.length){
                   App.ResourceArtifacts.PlanRules.add(response.data);
               }
           }
        });
    }

});