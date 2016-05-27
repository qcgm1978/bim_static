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
        "click .save":"save",
        "click .choose":"choose",
        "click .myDropText":"seleRule",
        "click .myItem":"myItem"
    },


    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        this.getValue("(30,40]");
    },
    //ѡ��������
    choose:function(){

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
        if(_this.hasClass("myDropText")){
            _this.siblings(".myDropList").show();
        }
    },
    //�����¹���
    addNewRule:function(){
        var _this = this;
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        var newRule = new App.Resources.ArtifactsPlanRuleDetailNew({model:model}).render().el;
        this.$(".conR dl").append(newRule);
        //��collection���
        //��this.model ���һ������
    },
    //����
    save:function(){

    },
    //ɾ���ƻ��е���������
    deletePlanRule:function(){

    },
    //ɾ����������
    deleteRule:function(){

    },
    //����ģ��
    legend:function(){

    },
    //У��ģ��
    check:function(){

    },
    //��ʾ��
    window:function(){

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