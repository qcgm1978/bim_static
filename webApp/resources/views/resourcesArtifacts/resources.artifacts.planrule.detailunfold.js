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
        "click .delRule": "delRule",
        "focus .categoryCode": "legend"
    },
    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(model){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"mappingCategoryChange",this.render);
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


    //增加新规则
    addNewRule:function(){
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        App.ResourceArtifacts.operator.add(model);
    },

    //保存
    saveRule:function(){
        //校验
        var  check = this.check();
        if(!check){return}

        var _this =this;

        //查找所有数据，拼接成字符串
        var title =  this.$(".ruleTitle");
        var id = title.data("id");

        var categoryCode = this.$(".typeCode input").val();
        var categoryName = this.$(".chide").attr("data-name");

        if(!categoryCode){
            alert("规则编码不能为空!");
            return
        }
        if(!categoryName){
            alert("规则名称不能为空!");
            return
        }


        var model = App.ResourceArtifacts.saveRuleModel();
        var dd =  this.$("dd");
        var Rulist = [];


        for(var i =0 ; i < dd.length ; i++){
            Rulist[i]  ={};
            var propertyKey = dd.eq(i).find(".leftten input");
            if(!propertyKey.val()){
                propertyKey.focus();
                alert("规则名称不能为空！");
                return
            }
            Rulist[i].propertyKey = propertyKey.val();



            Rulist[i].operator = dd.eq(i).find(".leftten .myDropDown").attr("data-operator");


            if(dd.eq(i).find(".eIn").hasClass("active")){
                var name = dd.eq(i).find(".eIn input");
                if(!name.val()){
                    name.focus();
                    alert("规则内容不能为空");
                    return
                }
                Rulist[i].propertyValue = name.val();

            }else if(dd.eq(i).find(".ioside").hasClass("active")){
                if(!dd.eq(i).find(".ioside.active").length && !dd.eq(i).find(".eIn.active").length){
                    alert("至少选一项规则！");
                    return
                }
                var left = dd.eq(i).find(".ioside .myDropDown").eq(0);
                var leftValue = dd.eq(i).find(".ioside input").eq(0);
                var right = dd.eq(i).find(".ioside .myDropDown").eq(1);
                var rightValue = dd.eq(i).find(".ioside input").eq(1);

                if(!leftValue.val() && !rightValue.val()){
                    leftValue.focus();
                    alert("请至少填写一项数据");
                    //设定数据
                    return
                }

                var str = left.data("operator")  + leftValue.val() +","+ rightValue.val()+ right.data("operator") ;
                Rulist[i].propertyValue = str;
            }
        }
        if(id){
            model.id = this.model.get("id");
        }


        model.biz =  this.model.get("biz") || App.ResourceArtifacts.Status.biz; //后期设定
        model.type =  this.model.get("type") || App.ResourceArtifacts.Status.type; //后期设定
        model.targetCode =  App.ResourceArtifacts.Status.presentPlan.get("code");
        model.targetName =  App.ResourceArtifacts.Status.presentPlan.get("targetName");
        model.mappingCategory.categoryCode = categoryCode;
        model.mappingCategory.categoryName = categoryName;
        model.mappingCategory.mappingPropertyList = Rulist;

        //operator 为空

        var cdata = {
            URLtype : '',
            type:"POST",
            data : JSON.stringify(model),
            contentType: "application/json",
            projectId : App.ResourceArtifacts.Status.projectId
        };

        if(this.model.get("id")){
            cdata.URLtype = "modifyArtifactsPlanRule";
            model.id = this.model.get("id");
            cdata.type ="PUT";
            //更新
        }else{
            cdata.URLtype = "createArtifactsPlanNewRule";
            //创建


            App.ResourceArtifacts.PlanRules.each(function(item){
                if(item.get("code") ==App.ResourceArtifacts.Status.presentPlan.get("code")){
                    App.ResourceArtifacts.PlanRules.remove(item);
                    App.ResourceArtifacts.PlanRules.add(model);
                }
            });

            $(".artifactsContent .rules h2 .name").html(App.ResourceArtifacts.Status.presentPlan.get("code")+ "&nbsp;" +App.ResourceArtifacts.Status.presentPlan.get("name"));
            App.ResourceArtifacts.Status.presentPlan.set("count",Rulist.length);
            $(".artifactsContent .rules .delt").closest("li").remove();
            $(".artifactsContent .rules h2 i").html( "("+Rulist.length + ")");

        }

        $(".artifactsContent .rules").addClass("services_loading");
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data){
                _this.$el.closest(".ruleDetail").hide().empty();
                //创建
                if(cdata.URLtype == "createArtifactsPlanNewRule"){
                    _this.model.set("id",response.data.id);
                    App.ResourceArtifacts.Status.delRule = response.data.id;
                }
                _this.reset();
                $(".artifactsContent .rules").removeClass("services_loading");
            }
        });

    },

    //重置保存状态
    reset:function(){
        App.ResourceArtifacts.Status.saved = true ;
    },

    //删除计划中的整条规则
    deleteRule:function(){

        App.ResourceArtifacts.Status.delRule = this.model.get("id");

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

        pre.on("keyup",function(e){
            App.Resources.cancelBubble(e);
            var val = pre.val(),test, count = 5,str = '',index,arr = [],unResult = "<li>搜索：无匹配结果</li>";  //显示5条
            list.html("");
            val = val.replace(/\s+/,'');
            if(!val){list.hide();return}
            val = val.replace(/\u3002+/,'.');
            //禁止输出除数字，半角句号外的
            test = /[^\d\.]+/.test(val);
            if(test){
                list.html(unResult);
                return;
            }

            str = val;
            var x = str.length%3;
            if(x ==0){
                if(_.last(str) != "."){ list.html(unResult);return}
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
                list.html(unResult);
                return
            }
            for(var j = index  ;  j < App.Resources.artifactsTreeData.length  ; j++){
                if(App.Resources.artifactsTreeData[j].length <= val.length ||  j - index  + 1 >count) {
                    break
                }
                var newRule = new App.ResourceArtifacts.newCode(App.Resources.artifactsTreeData[j]);
                list.append(new App.Resources.ArtifactsRuleLegend({model:newRule}).render().el);
            }
        });
    },

    //校验模块
    check:function(){
        var vals = this.$(".categoryCode");
        if(!vals.val()){
            vals.focus();
            this.redAlert(vals);
            return false;
        }
       return true
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
    }
});