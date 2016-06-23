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
        this.detail = new App.Resources.ArtifactsTplDetail();
        this.menu = new App.Resources.ArtifactsMapRule();
        this.plans = new App.Resources.ArtifactsPlanList();
        this.planRule = new App.Resources.ArtifactsPlanRule();
        this.quality = new App.Resources.ArtifactsQualityList();//������׼�����
        this.planRuleTitle = new App.Resources.ArtifactsPlanRuleTitle();  //����ͷ��

        this.$(".tplContent .content").html(this.detail.render().el);
        this.detail.$(".tplDetailCon").append(this.menu.render().el);//�˵�
        this.menu.$(".plans").append(this.plans.render().el);//�ƻ�
        this.menu.$(".rules").append(this.planRuleTitle.render().el);//����
        this.planRuleTitle.$(".ruleContentRuleList").append(this.planRule.render().el);//�����б�
        this.menu.$(".qualifyC").append(this.quality.render().el);//����

        $("#artifacts").addClass("tpl");//�˴�Ϊ������ʽ����

        //�޸�����
        this.detail.$(".tplDetailTitle h2").text(name);
        this.detail.$(".tplDetailTitle .tplName").val(name);
        this.detail.$(".artifactsContent").addClass("explorer");
        this.detail.$(".artifactsContent .default").show().siblings().hide();


        this.$(".tplContent>.default").hide();
        //��ȡ�б�
        this.getTplRule();//��ȡ����ģ���б�
        App.ResourceArtifacts.getPlan();

        App.ResourceArtifacts.getAllQuality(function(){
            //����
            App.ResourceArtifacts.departQuality(_this.menu.$(".qualityMenuListGC"),App.ResourceArtifacts.allQualityGC,null,"0");
            _this.menu.$(".qualityMenuListGC").show();
            App.ResourceArtifacts.departQuality(_this.menu.$(".qualityMenuListKY"),App.ResourceArtifacts.allQualityKY,null,"0");
        });
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
                    _this.menu.$(".plans").html(_this.plans.render().el);
                    _this.menu.$(".rules .ruleContent").html(_this.planRule.render().el);
                    App.ResourceArtifacts.TplCollectionRule.add(response.data);
                    $(".tplContent").removeClass("services_loading");
                    _this.menu.$(".artifactsContent .default").hide();
                    _this.menu.$(".artifactsContent .plans").show();
                    _this.menu.$(".artifactsContent .rules").show();
                }else{
                    //û���κι���ʱ�򣬴�������ť
                    _this.menu.$(".artifactsContent .default").siblings().hide();
                    $(".tplContent").removeClass("services_loading");
                }
            }
        })
    }
});