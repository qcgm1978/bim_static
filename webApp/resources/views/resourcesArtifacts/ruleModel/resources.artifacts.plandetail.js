/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.plandetail.html"),

    events:{
        "click .item":"getPlanId"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.changeCount,this);
    },

    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode ){
            this.model.set({count:count},{silent:true});
            this.$(".count").text("("+ count + ")");
        }
    },

    //ȡ�ù����б�
    getPlanId:function(e){

        var $this = $(e.target);
        if($this.closest("li").hasClass("active")){
            return
        }
        App.ResourceArtifacts.PlanRules.reset();

         App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");

        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        App.ResourceArtifacts.loading($(".rules"));

        this.toggleClass();
        this. getRules();



    },
//�л��ƻ�
    toggleClass:function(e){
        $(".artifactsList .plcon li").removeClass("active");
        this.$el.addClass("active");
    },
//��ȡ�ƻ��ڵ���ع���
    getRules:function() {

        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:App.ResourceArtifacts.Status.rule.targetCode,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.Status.rule.biz = pdata.data.biz = 1 ;

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    App.ResourceArtifacts.Status.rule.count  = response.data.length = 0;
                    Backbone.trigger("mappingRuleNoContent")
                }
                Backbone.trigger("resetTitle");
            }
            App.ResourceArtifacts.loaded($(".rules"));
        });
    }
});