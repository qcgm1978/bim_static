/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .default" : "create",
        "click .rules" : "closeMenu"
    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);

        var tabs = App.Comm.AuthConfig.resource.mappingRule,
            Auth = App.AuthObj.lib;
        if(Auth.moduleMappingRule.view){
            this.$(".artifactsNav ul").append(tabs.module);
            this.$(".artifactsNav ul .modularization").addClass("active");
            App.ResourceArtifacts.Status.rule.biz = 1;
        }
        if(Auth.qualityMappingRule.view){
            this.$(".artifactsNav ul").append(tabs.quality);
            if(!Auth.moduleMappingRule.view){
                this.$(".artifactsNav ul .quality").addClass("active");
            }
            App.ResourceArtifacts.Status.rule.biz = 2;
        }
        if(Auth.moduleMappingRule.view && Auth.qualityMappingRule.view){
            App.ResourceArtifacts.Status.rule.biz = 1;
        }

        return this;
    },

    closeMenu:function(){
        this.$(".ruleDetail .conR ul").hide();
    },

    initialize:function(){
        Backbone.on("startFromProject",this.startFromProject,this);
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("projectMappingRuleCheckedClose",this.checkClose,this);
        Backbone.on("resetRule",this.resetRule,this);
    },

    checkList:function(){
       this.$(".artifactsContent").addClass("edit").removeClass("explorer");

    },

    checkClose:function(){
        this.$(".artifactsContent").removeClass("edit").addClass("explorer");
    },

    startFromProject:function(){
        //������Ŀ����
    },

    //�л�ѡ��
    select:function(e){
        var $pre = $(e.target),_this = this;

        App.ResourceArtifacts.Status.saved = true;

        if($pre.closest(".artifactsNav").length){
            if(!$pre.hasClass("active")){
                $pre.addClass("active").siblings("li").removeClass("active");
            }
        }


        var modularization = this.$(".modularization.active").length;
        var quality = this.$(".quality.active").length;

        if(modularization){//ģ�黯
            App.ResourceArtifacts.Status.rule.biz = 1 ;
            if(this.$(".default:visible").length){
                return
            }

            this.$(".qualifyC").hide();
            this.$(".qualifyC li").removeClass("active");
            this.$(".plans").show();

            this.resetRule();

        }else if(quality){//����
            App.ResourceArtifacts.Status.rule.biz = 2 ;
            if(this.$(".default:visible").length){
                return
            }

            this.resetRule();

            this.$(".plans").hide();
            this.$(".qualifyC").show();
            this.$(".plans li").removeClass("active");
        }
        this.$(".rules").show();
    },
    //���ù���
    resetRule:function(){
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
        this.$(".rules h2 .name").html("û��ѡ��ģ��/������׼");
        this.$(".ruleContentRuleList ul").html("<li><div class='ruleTitle delt'>��������</div></li>");
    },

    //Ϊ��Ŀ���ô�������
    create:function(e){
        if(App.AuthObj.lib.mappingRuleTemplate.edit){
            this.$(".default").hide();
            this.select(e);
            Backbone.trigger("mappingRuleModelEdit");
        }else{
            alert("��û���޸�ģ��Ȩ�ޣ�")
        }

    }
});