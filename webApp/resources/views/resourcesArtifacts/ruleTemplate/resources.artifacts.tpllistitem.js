/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplListItem = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllistitem.html"),

    events:{
        "click .item":"getTpl"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"remove",this.render);
        Backbone.on("resourcesChangeMappingRuleModelName",this.changeName,this);
    },
    //�޸�ģ������ʱ�޸�����
    changeName:function(){
        if(this.$(".item").attr("data-id") == App.ResourceArtifacts.Status.templateId){
            this.$(".item div").text(App.ResourceArtifacts.Status.templateName);
            this.model.set("name",App.ResourceArtifacts.Status.templateName)
        }
    },
    //ȡ��ģ��
    getTpl:function(){
        if(App.ResourceArtifacts.modelEdit){
            alert("�༭״̬�����л�ģ��");
            return;
        }
        var _this = this;
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//����id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//����name
        App.ResourceArtifacts.resetModelRuleSaveData();//����Ҫ���������
        this.toggleClass();
        //����״̬
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        App.ResourceArtifacts.getPlan();
        App.ResourceArtifacts.getAllQuality(function(){
            App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListGC"),App.ResourceArtifacts.allQualityGC,null,null);
            App.ResourceArtifacts.menu.$(".qualityMenuListGC").show();
            App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListKY"),App.ResourceArtifacts.allQualityKY,null,null);
            App.ResourceArtifacts.tplFrame.$(".tplContent").removeClass("services_loading");
        });
        Backbone.trigger("mappingRuleModelLoadContent",this.model.get("name"));
    },
    //�л�
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    }
});