/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailUnfold = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailunfold.html"),

    events:{
        "click .tabRule":"tabRule",
        "click .addNewRule":"addNewRule",
        "click .deleteRule":"deleteRule",
        "click .saveRule":"saveRule",
        "click .choose":"choose",
        "click .myDropText":"seleRule",
        "click .myItem":"myItem",
        "click .delRule": "delRule",
        "focus .categoryCode": "legend"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        //this.getValue("(30,40]");
    },
    //ѡ��������
    choose:function(){
        var frame = "";
        this.window(frame);
    },
    //ѡ������л����뷽ʽ
    myItem:function(e){
        var _this = $(e.target);
        var val = _this.data("val");
        var text = _this.text();
        var parent =  _this.parent(".myDropList");
        var eIn = _this.closest(".leftten").siblings(".eIn");
        var ioside  = _this.closest(".leftten").siblings(".ioside");
        //����д��ģ��
        parent.hide().siblings(".myDropText").find(".text").text(text);
        if(val == "==" || val == "!="){
            ioside.removeClass("active");
            if(eIn.hasClass("active")){return}
            eIn.addClass("active");
        }else if(val == "<>" || val == "><"){
            eIn.removeClass("active");
            if(ioside.hasClass("active")){return}
            ioside.addClass("active");
        }
    },
    //�л�����
    seleRule:function(e){
        $(".myDropList").hide();
        var _this = $(e.target);
        _this.siblings(".myDropList").show();
    },
    //�����¹���
    addNewRule:function(){
        var _this = this;
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        var newRule = new App.Resources.ArtifactsPlanRuleDetailNew({model:model}).render().el;
        this.$(".conR dl").append(newRule);
        //��Ϊ�½��������޸ĵ�ģ�Ͳ�һ��
        //��collection���
        //��this.model ���һ������
    },
    //����
    saveRule:function(){

        //У��
        var  check = this.check();
        if(!check){return}

        var _this =this;
        var cdata = {
            URLtype : '',
            type:"POST",
            data:{}
        };
        if(this.model.get("id")){
            cdata.URLtype = "modifyArtifactsPlanRule";
            //����
        }else{
            cdata.URLtype = "createArtifactsPlanNewRule";
            //����
        }

        //��ʱ����
        this.$el.closest(".ruleDetail").hide().empty();
        App.ResourceArtifacts.Status.saved = true ;//����״̬

        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.id){
                if(cdata.URLtype == "createArtifactsPlanNewRule"){
                    _this.createRule();
                }
                _this.$el.closest(".ruleDetail").hide().empty();
                _this.reset();
            }
        });
      /* �������� {
            "messageId": "8dd37a0f592c4d7e8a13895ea1ac3c2a",
            "messageType": null,
            "timestamp": 1464599023448,
            "code": 0,
            "message": "success",
            "data": {
            "id": 842508543648096
            }
        }
        */
    },
    //����
    createRule:function(response){
        this.model.set("id",response.data.id);
    },
    //���ñ���״̬
    reset:function(){
        App.ResourceArtifacts.Status.saved = true ;
    },

    //ɾ���ƻ��е���������
    deleteRule:function(){
        var _this = this;
        //�½���δ�޸�
        if(!_this.model.get("id") && App.ResourceArtifacts.Status.saved){//���δ�޸�����գ�ע���½�ʱ���޸�   App.ResourceArtifacts.Status.saved ֵ�����
            _this.$el.closest("li").hide().empty();
            _this.reset();
            return
        }
        var frame = new App.Resources.ArtifactsPlanRuleAlert().render().el;
            App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
                title: "",
                width: 280,
                height: 180,
                isConfirm: false,
                isAlert: false,
                message: frame
            });
            $(".mod-dialog .wrapper .header").hide();//����ͷ��
            $(".alertInfo").html('ȷ��ɾ�� ��'+ _this.model.get("targetName") + '����');
    },
    //ɾ����������
    delRule:function(e){
        var rule = $(e.target),_this = this;

        var id  = rule.siblings(".leftten").data("id");

        var list = _this.model.get(".mappingCategory")["mappingPropertyList"];
        for(var i = 0 ; i < list.length ; i ++){
            if(list[i].id == id){
                list.splice(i,1)
            }
        }
        _this.model.set(".mappingPropertyList",list);

        var parentId = $(".artifactsContent .rules h2").data("id");
        //�����dd��
        //���ģ���е�dd��
    },

    //����data-id����ɾ������


    //����ģ��
    legend:function(e){
        var pre = $(e.target);
        pre.on("keydown",function(ev){
            var val = pre.val();
            //�ӿ��������ҵ�ǰֵ
        });
    },
    //У��ģ��
    check:function(){
        return true;
    },
    //��ʼ������
    window:function(frame){
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"ѡ��������",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
    },
    //ѡ��������
    chooseWindow:function(){

    },
    //���value�ַ���
    getValue:function(str){
        if( typeof str != "string"){return}
        var arr = str.slice(",");
    }
});