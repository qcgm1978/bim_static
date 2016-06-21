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

    initialize:function(){},

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

    //���棬Ҫ��д
    resourcesSure:function(){
        var _this = this;

        var modelSaving = App.ResourceArtifacts.modelSaving;
        //���������ģ��id���޷�����
        if(!App.ResourceArtifacts.Status.templateId){
            return
        }
        App.ResourceArtifacts.modelSaving.templateId = App.ResourceArtifacts.Status.templateId;
        App.ResourceArtifacts.modelSaving.templateName = App.ResourceArtifacts.Status.templateName = this.$(".tplDetailEdit .tplName").val();


        console.log(App.ResourceArtifacts.modelSaving);

        //Ҫ�����������Ƿ���Ҷ�ӽڵ�ֱ�ӹ��˼��ɣ��������
        var pdata = {
            URLtype: "saveArtifactsTemplateRule",
            type:"PUT",
            data:JSON.stringify(modelSaving),
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