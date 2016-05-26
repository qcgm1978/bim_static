/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plandetail.html"),

    events:{
        "click .planItem":"getPlanId"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){},
    //取得规则列表
    getPlanId:function(){
        var  planId = this.model.get("planId");
        if(!planId){return;}



        $(".artifactsContent .rules ul").empty();


        this.toggleClass();
        this. getRules(planId);
    },

    toggleClass:function(){
        $(".artifactsList li").removeClass("active");
        this.$el.addClass("active");
    },

    getRules:function(planId) {
        var _this = this ;
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                planId:planId
            }
        };
        App.Comm.ajax(pdata,function(response){
           if(response.code == 0 ){
               App.ResourceArtifacts.PlanRules.reset();
               if(response.data  &&  response.data.length){
                    $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                    $(".artifactsContent .rules h2 .name").html(_this.model.get("planId") + "&nbsp;" +_this.model.get("desc"));
                   App.ResourceArtifacts.PlanRules.add(response.data);
               }
           }
        });
    }

});