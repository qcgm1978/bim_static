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
    },
    //ȡ��ģ��
    getTpl:function(){

        var _this = this;
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//����id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//����name

        //����״̬
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        this.toggleClass();

        $(".tplContent").addClass("services_loading");
        //�����Ҳ��б�
        this.detail = new App.Resources.ArtifactsTplDetail();
        this.menu = new App.Resources.ArtifactsMapRule();
        this.plans = new App.Resources.ArtifactsPlanList();
        this.planRule = new App.Resources.ArtifactsPlanRule();
        this.quality = new App.Resources.ArtifactsQualityList();//������׼�����
        this.planRuleTitle = new App.Resources.ArtifactsPlanRuleTitle();  //����ͷ��

        $(".tplContent").html(this.detail.render().el);
        this.detail.$(".tplDetailCon").append(this.menu.render().el);//�˵�
        this.menu.$(".plans").append(this.plans.render().el);//�ƻ�
        this.menu.$(".rules").append(this.planRuleTitle.render().el);//�ƻ�
        this.planRuleTitle.$(".ruleContentRuleList").append(this.planRule.render().el);//�ƻ�
        this.menu.$(".qualifyC").append(this.quality.render().el);//����



        $("#artifacts").addClass("tpl");//�˴�Ϊ������ʽ����

        //�޸�����
        $(".tplDetailTitle h2").text(this.model.get("name"));
        $(".tplDetailTitle .tplName").val(this.model.get("name"));


        _this.menu.$(".artifactsContent .default").show().siblings().hide();
        //��ȡ�б�
        this.getTplRule();//��ȡ����ģ���б�
        App.ResourceArtifacts.getPlan();
        App.ResourceArtifacts.getQuality();
    },
    //�л�
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
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