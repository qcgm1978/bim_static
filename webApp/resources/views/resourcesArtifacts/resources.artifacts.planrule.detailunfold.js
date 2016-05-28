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
    //选择分类编码
    choose:function(){
        this.window();
    },
    //选择规则，切换输入方式
    myItem:function(e){
        var _this = $(e.target);
        var val = _this.data("val");
        var text = _this.text();
        var parent =  _this.parent(".myDropList");
        var eIn = _this.closest(".leftten").siblings(".eIn");
        var ioside  = _this.closest(".leftten").siblings(".ioside");
        //数据写入模型
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
    //切换规则
    seleRule:function(e){
        $(".myDropList").hide();
        var _this = $(e.target);
        _this.siblings(".myDropList").show();
    },
    //增加新规则
    addNewRule:function(){
        var _this = this;
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        var newRule = new App.Resources.ArtifactsPlanRuleDetailNew({model:model}).render().el;
        this.$(".conR dl").append(newRule);
        //向collection添加
        //向this.model 添加一条属性
    },
    //保存
    save:function(){

    },
    //删除计划中的整条规则
    deletePlanRule:function(){

    },
    //删除单条规则
    deleteRule:function(){

    },
    //联想模块
    legend:function(){

    },
    //校验模块
    check:function(){

    },
    //初始化窗口
    window:function(frame){
        var _this =this;
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"选择分类编码",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
        //$(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:_this.model}).render().el);//当前用户
    },
    //选择分类编码
    chooseWindow:function(){

    },
    //拆解value字符串
    getValue:function(str){
        if( typeof str != "string"){return}
        var arr = str.slice(",");
    }
});