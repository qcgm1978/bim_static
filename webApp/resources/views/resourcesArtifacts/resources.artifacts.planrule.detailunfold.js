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
        //"blur .categoryCode": "legendClose"
    },
    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"mappingCategoryChange",this.render);
        //this.getValue("(30,40]");
    },
    //选择分类编码
    choose:function(){
        var tree  = new App.Resources.ArtifactsWindowRule().render().el;
        this.window(tree);
        App.Resources.ArtifactsMaskWindow.find(".content").css({"position":"relative"});
        var contain = App.Resources.artifactsTree(App.Resources.artifactsTreeData);
        $("#resourcesArtifactTree").html(contain);
        App.ResourceArtifacts.presentRule = this;
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
        //
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.id){

                //创建
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
        var list = _this.model.get("mappingCategory")["mappingPropertyList"];
        for(var i = 0 ; i < list.length ; i ++){
            if(list[i].id == id){
                list.splice(i,1)
            }
        }
        _this.model.set(".mappingPropertyList",list);
        rule.closest("dd").remove();
    },

    //联想模块
    legend:function(e){
        var _this = this;
        _this.$(".chide").css({"visibility":"hidden"});
        var ac = _.map(App.Resources.artifactsTreeData,function(item){return item.code}); //对象-数组
        var pre = $(e.target);
        $(e.target).addClass("active");
        pre.css({"opacity":"1"});
        //输入不合法，无法找到
        var list = pre.closest("div").siblings("ul");
        list.html();

        if(pre.val()){
            list.show();
        }
        //变红
        pre.on("keydown",function(){
            list.show();
            pre.removeClass("alert");
        });


        pre.on("keyup",function(ev){
            var val = pre.val(),test, count = 5,str = '',index,arr = [];  //显示5条
            list.html("");
            val = val.replace(/\s+/,'');
            if(!val){list.hide();return}
            val = val.replace(/\u3002+/,'.');
            //禁止输出除数字，半角句号外的
            test = /[^\d\.]+/.test(val);
            if(test){
                list.html("<li>搜索：无匹配结果</li>");
                return;
            }

            str = val;
            var x = str.length%3;
            if(x ==0){
                str = _.initial(str);
                str = str.join('');
                index = _.indexOf(ac,str,true);
            }else if(x == 1){
                for(var s = 0 ; s< 9 ; s++){
                    var sd = str + s + '';
                    index = _.indexOf(ac,sd);
                    if(index >= 0){
                        break
                    }
                }
            }else{
                index = _.indexOf(ac,str,true);
            }

            if(index < 0 ){
                list.html("<li>搜索：无匹配结果</li>");
                return
            }
            for(var j = index  ;  j < App.Resources.artifactsTreeData.length  ; j++){
                if(App.Resources.artifactsTreeData[j].length <= val.length ||  j - index  + 1 >count) {
                    break
                }
               // arr.push(App.Resources.artifactsTreeData[j]);
                //此处创建新view
                var newRule = new App.ResourceArtifacts.newCode(App.Resources.artifactsTreeData[j]);
                list.append(new App.Resources.ArtifactsRuleLegend({model:newRule}).render().el);
            }
        });
    },
    //关闭联想
    legendClose:function(e){
        $(e.target).removeClass("active");
        var val = $(e.target).val();
        //此处要保存数据
        this.$(".chide").css({"visibility":"visible"});
        $(e.target).css({"opacity":"0"}).closest("div").siblings("ul").hide();
    },

    //校验模块
    check:function(){
        var vals = this.$(".categoryCode");
        if(!vals.val()){
            vals.focus();
            this.redAlert(vals)
        }
        return false;
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

    //红色提示输入
    redAlert:function(ele){
        ele.addClass("alert");
    },

    //因为数据格式导致的保存数据到模型的额外内容
    saveDataToModel:function(title,data){
        var con = App.ResourceArtifacts.presentRule.model.get("mappingCategory");
        con[title] =  typeof data == "number" ? data + '' : data;
        App.ResourceArtifacts.presentRule.model.set({"mappingCategory":con});
        App.ResourceArtifacts.presentRule.model.trigger("mappingCategoryChange");//重绘模型
    },
    //因为数据格式导致的保存数组到模型的额外内容
    saveArrayToModel:function(id,title,data){
        var con = App.ResourceArtifacts.presentRule.model.get("mappingCategory");
        var arr = con.mappingPropertyList;
        for(var i = 0 ;i < arr.length ; i++){
            if(arr[i].id == id){
                arr[i][title] =data;
            }
        }
        con.mappingPropertyList = arr;
        App.ResourceArtifacts.presentRule.model.set({"mappingCategory":con});
        App.ResourceArtifacts.presentRule.model.trigger("mappingCategoryChange");//重绘模型
    }
});