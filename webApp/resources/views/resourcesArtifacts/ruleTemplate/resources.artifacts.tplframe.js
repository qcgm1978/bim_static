/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplFrame = Backbone.View.extend({

    tagName:"div",

    className: "artifactsTplFrame",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tplframe.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        Backbone.on("mappingRuleModelLoadContent",this.loadContent,this);
        Backbone.on("mappingRuleResetModel",this.mappingRuleResetModel,this);
    },

    mappingRuleResetModel:function(){
        this.$(".tplContent>.default").show();
    },

    //д������
    loadContent:function(name){
        var _this = this;
        this.$(".tplContent").addClass("services_loading");
        //�����Ҳ��б�
        $("#artifacts").addClass("tpl");//�˴�Ϊ������ʽ����
        //�޸�����
        this.$(".tplDetailTitle h2").text(name);
        this.$(".tplDetailTitle .tplName").val(name);
        this.$(".artifactsContent").addClass("explorer");
        this.$(".artifactsContent .default").show().siblings().hide();

        this.$(".tplContent>.default").hide();
        //��ȡ�б�
        this.getTplRule();//��ȡ����ģ���б�
    },

    //��ȡģ������б�
    getTplRule:function(){
        var _this = this;
        var pdata = {
            URLtype:"fetchArtifactsTemplateRule",
            data:{
                templateId : App.ResourceArtifacts.Status.templateId
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data){
                if(response.data.length){
                    App.ResourceArtifacts.TplCollectionRule.add(response.data);
                    _this.$(".artifactsContent .default").hide();
                    _this.$(".artifactsContent .plans").show();
                    _this.$(".artifactsContent .rules").show();
                }else{
                    //û���κι���ʱ�򣬴�������ť
                    _this.$(".artifactsContent .default").siblings().hide();
                }
                _this.$(".tplContent").removeClass("services_loading");
            }
        })
    }
});