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
        //this.listenTo(App.ResourceArtifacts.TplCollectionRule,"reset",this.render);
    },

    delete:function(){
        var _this = this;
        var frame = new App.Resources.ArtifactsTplAlert();
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
        Backbone.trigger("checkedChange");
    },

    //��ģ��Ϊ��ʱ����
    reset:function(){
        this.$(".tplDetailInfo h2").empty();
    },

    //����
    resourcesSure:function(){

        if(!App.ResourceArtifacts.Status.templateId){
            return
        }


        var _this = this;
        App.ResourceArtifacts.modelRuleSaveData.templateId = App.ResourceArtifacts.Status.templateId;
        App.ResourceArtifacts.modelRuleSaveData.templateName = App.ResourceArtifacts.Status.templateName = this.$(".tplDetailEdit .tplName").val();
        //�ƻ�
        var plan = _.filter($(".artifactsContent .plans li"),function(item){
            return $(item).attr("data-check") == "1";
        });
        //�����collection����ѡ���������δѡ����ӣ�����rule��planruledetail������ӣ�ÿ����Ƚ�id
        App.ResourceArtifacts.PlanNode.each(function(item){
            for(var i = 0  ; i < plan.length ; i++){
                if(item.get("code") == $(plan[i]).attr("data-code")){
                    if(item.get("ruleContain") != 1){
                        App.ResourceArtifacts.modelRuleSaveData.codeIdsIn.push(item.get("code"));
                        return
                    }
                }
            }
        }) ;
        //����
        //��Ҫ�����code��ruleContain�����code�У��������δѡ����ӣ�����rule��planruledetail�������
        var qualifyC = _.filter($(".qualifyC .qualityMenuList ul li"),function(item){
            return $(item).attr("data-check") == "1" && $(item).attr("data-leaf") == "1";
        });

        _.each(qualifyC,function(item){
            App.ResourceArtifacts.modelRuleSaveData.codeIdsIn.push($(item).attr("data-code"));
        });


        var pdata = {
            URLtype: "saveArtifactsTemplateRule",
            type:"PUT",
            data:JSON.stringify(App.ResourceArtifacts.modelRuleSaveData),
            contentType: "application/json"
        };

        App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){
            console.log(response);
            if(response.code == 0 ){


                //����ģ������
                _this.$(".tplDetailTitle h2").text(App.ResourceArtifacts.Status.templateName);

                Backbone.trigger("resourcesChangeMappingRuleModelName");
                _this.resourcesCancel();
            }else{
            //�ύʧ��
            alert("�ύʧ��");
        }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    },
    //ȡ��
    resourcesCancel:function(){
        this.$(".tplDetailInfo").show();
        this.$(".tplDetailEdit").hide();
        Backbone.trigger("projectMappingRuleCheckedClose");
    }
});