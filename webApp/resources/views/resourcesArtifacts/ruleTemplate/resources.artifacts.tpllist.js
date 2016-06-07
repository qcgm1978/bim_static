/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplList = Backbone.View.extend({

    tagName:"div",

    className: "artifactsList",

    events:{

        "click .newPlanRule":"newPlanRule"
    },


    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllist.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.TplCollection,"add",this.addOne);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsTplDetail({model: model});
        this.$("ul").append(newList.render().el);
        App.Comm.initScroll($(".list"),"y");
    },

    //��������
    newPlanRule:function(){
        var _this = this;
        //ֱ���������Ƽ���



        if( !App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            //����δ�����Ԫ�ز�������ʾ���
            return
        }

        var frame = ""; //�½�ģ��
        this.window(frame);
    },


    //��ʼ������
    window:function(frame){
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"�½�ģ��",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
    }
});