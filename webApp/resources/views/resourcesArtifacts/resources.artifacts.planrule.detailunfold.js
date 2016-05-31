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
    //选择分类编码
    choose:function(){
        var frame = "";
        this.window(frame);
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
        //因为新建整条与修改的模型不一致
        //向collection添加
        //向this.model 添加一条属性
    },
    //保存
    saveRule:function(){

        //校验
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
            //更新
        }else{
            cdata.URLtype = "createArtifactsPlanNewRule";
            //创建
        }

        //临时内容
        this.$el.closest(".ruleDetail").hide().empty();
        App.ResourceArtifacts.Status.saved = true ;//保存状态

        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.id){
                if(cdata.URLtype == "createArtifactsPlanNewRule"){
                    _this.createRule();
                }
                _this.$el.closest(".ruleDetail").hide().empty();
                _this.reset();
            }
        });
      /* 返回数据 {
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
    //创建
    createRule:function(response){
        this.model.set("id",response.data.id);
    },
    //重置保存状态
    reset:function(){
        App.ResourceArtifacts.Status.saved = true ;
    },

    //删除计划中的整条规则
    deleteRule:function(){
        var _this = this;
        //新建且未修改
        if(!_this.model.get("id") && App.ResourceArtifacts.Status.saved){//如果未修改则清空，注意新建时已修改   App.ResourceArtifacts.Status.saved 值，因此
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
            $(".mod-dialog .wrapper .header").hide();//隐藏头部
            $(".alertInfo").html('确认删除 “'+ _this.model.get("targetName") + '”！');
    },
    //删除单条规则
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
        //清除本dd项
        //清除模型中的dd项
    },

    //根据data-id查找删除对象


    //联想模块
    legend:function(e){
        var pre = $(e.target);
        pre.on("keydown",function(ev){
            var val = pre.val();
            //从库对象里查找当前值
        });
    },
    //校验模块
    check:function(){
        return true;
    },
    //初始化窗口
    window:function(frame){
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