/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplDetail = Backbone.View.extend({

    tagName:"div",
    className:"cont",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpldetail.html"),

    events:{
        "click .delete":"delete",
        "click .edit":"edit",
        "click #resourcesSure":"resourcesSure",
        "click #resourcesCancel":"resourcesCancel"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){

    },

    delete:function(){
        var _this = this;
        var frame = new App.Resources.ArtifactsPlanRuleAlert();
        App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 180,
            isConfirm: false,
            isAlert: false,
            message: frame.render().el
        });
        $(".mod-dialog .wrapper .header").hide();//����ͷ��
        frame.$(".alertInfo").html('ȷ��ɾ�� ��'+ App.ResourceArtifacts.Status.templateName   +' "?');
    },

//�༭
    edit:function() {
        this.$(".tplDetailInfo").hide();
        this.$(".tplDetailEdit").show();
    },

    //����
    resourcesSure:function(){
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
                    $(".ruleContent ul").html("<li><div class='ruleTitle delt'>��������</div></li>");
                }
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    },
    //ȡ��
    resourcesCancel:function(){
        this.$(".tplDetailInfo").show();
        this.$(".tplDetailEdit").hide();
    }
});