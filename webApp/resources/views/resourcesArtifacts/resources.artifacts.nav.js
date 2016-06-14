/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .default" : "create"

    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);

        App.ResourceArtifacts.Status.rule.biz = 1;
        var power = App.ResourceArtifacts.Settings.ruleModel;
        if(power == 1){
            this.$(".modularization").remove();
            this.$(".quality").addClass("active");
        }else if(power == 2){
            App.ResourceArtifacts.Status.rule.biz = 2;
            this.$(".quality").remove();
        }
        return this;
    },

    initialize:function(){
        this.getCategoryCode(); //��ȡ�������
        Backbone.on("startFromProject",this.startFromProject,this);
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("projectMappingRuleCheckedClose",this.checkClose,this);
    },

    checkList:function(){
       this.$(".artifactsContent").addClass("edit");
    },

    checkClose:function(){
        this.$(".artifactsContent").removeClass("edit");
    },

    startFromProject:function(){
        //������Ŀ����
    },

    select:function(e){
        var $pre = $(e.target),_this = this;

        if(!App.ResourceArtifacts.Status.saved ){
            alert("���ȱ��棡");
        }

        if($pre.closest(".artifactsNav").length){
            $pre.addClass("active").siblings("li").removeClass("active");
        }


        var modularization = this.$(".modularization.active").length;
        var quality = this.$(".quality.active").length;

        if(modularization){//ģ�黯
            App.ResourceArtifacts.Status.rule.biz = 1 ;
            if(this.$(".default:visible").length){
                return
            }


            this.$(".qualifyC").hide();
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
        }
        this.$(".rules").show();
    },

    getCategoryCode:function(){
        var cdata  = {
            URLtype:'fetchArtifactsCategoryRule',
            data :{
            }
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },
    //���ù���
    resetRule:function(){
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
        this.$(".rules h2 .name").html("û��ѡ��ģ��/������׼");
        this.$(".ruleContentRuleList ul").html("<li><div class='ruleTitle delt'>û��ѡ��ģ��/������׼</div></li>");
    },

    //Ϊ��Ŀ���ô�������
    create:function(e){
        this.$(".default").hide();
        this.select(e);
    }
});