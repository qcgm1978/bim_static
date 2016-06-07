/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplDetail = Backbone.View.extend({

    tagName:"div",
    className:"cont",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpldetail.html"),

    events:{
        "click .delete":"delete",
        "click .edit":"edit"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){

    },


    delete:function(){
        var templateId =App.ResourceArtifacts.Status.templateId;//±£´æid

        var pdata = {
            URLtype: "fetchArtifactsTemplateRule",
            data:{
                templateId: this.model.get("id")
            }
        };

        App.Comm.ajax(pdata,function(response){

        })
    },

//±à¼­
    edit:function() {
        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsTemplateRule",
            data:{
                templateId: this.model.get("id")
            }
        };
        //App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){

            if(response.code == 0 ){

                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.reset();
                    $(".artifactsContent .rules ul").empty();
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    $(".ruleContent ul").html("<li><div class='ruleTitle delt'>ÔÝÎÞÄÚÈÝ</div></li>");
                }
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    }
});