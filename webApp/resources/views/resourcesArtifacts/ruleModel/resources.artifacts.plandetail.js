/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.plandetail.html"),

    events:{
        "click .item":"getPlanId",
        "click .ruleCheck":"checked"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        var ruleContain = this.model.get("ruleContain");
        var a  = ruleContain == 1 ?  1 : 0;
        this.$el.attr("data-check", a);
        this.$el.attr("data-model",JSON.stringify(this.model.toJSON()));
        this.$el.attr("data-code", this.model.get("code"));
        return this;
    },

    initialize:function(){
        //this.listenTo(this.model,"change:checked",this.check);
        Backbone.on("resetTitle",this.changeCount,this);
        Backbone.on("modelRuleEmpty",this.modelRuleEmpty,this);
        Backbone.on("modelRuleFull",this.modelRuleFull,this);
        Backbone.on("modelRuleHalf",this.modelRuleHalf,this);
    },

    modelRuleEmpty:function(){
        if(App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").removeClass("all").removeClass("half");
            this.$el.attr("data-check","0")
        }
    },
    modelRuleFull:function(){
        if(App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")) {
            this.$(".ruleCheck").addClass("all").removeClass("half");
            this.$el.attr("data-check","1")
        }
    },
    modelRuleHalf:function(){
        if(App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").addClass("half").removeClass("all");
            this.$el.attr("data-check","0")
        }
    },

    checked:function(e){
        App.Resources.cancelBubble(e);
        var ele = $(e.target);
        var model = jQuery.parseJSON(this.$el.attr("data-model")),already;
        if(App.ResourceArtifacts.modelSaving.length){
            already = _.indexOf(App.ResourceArtifacts.modelSaving,function(item){
                return item.code = model.code
            });
        }

        if(ele.hasClass("all")){
            ele.removeClass("all");
            ele.closest("li").attr("data-check","0");
            //�����ύ����
            if(already>0){
                App.ResourceArtifacts.modelSaving[already].ruleIds = []
            }

            if(this.$el.hasClass("active")){
                Backbone.trigger("modelRuleSelectNone");
                //����ȫ��ѡ�¼�
            }
        }else{
            ele.addClass("all");
            ele.closest("li").attr("data-check","1");
            //�����ύ����
            if(already>0){
                App.ResourceArtifacts.modelSaving[already].ruleIds = model.ruleIds
            }

            if(this.$el.hasClass("active")){
                //����ȫѡ�¼�
                Backbone.trigger("modelRuleSelectAll");
            }
        }
        ele.removeClass("half");
        //������ģ������
    },

    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode){
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

        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }

        App.ResourceArtifacts.PlanRules.reset();

         App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");


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