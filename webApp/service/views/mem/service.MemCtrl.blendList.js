/*
 * @require  /service/views/mem/service.memCtrl.blendDetail.js
 */

var App = App || {};
App.Service.MemCtrlBlendList=Backbone.View.extend({

    tagName:"div",

    events:{
        "click .batchAward":"batchAward",//批量授权
        "click .selectAll":"selectAll"//全选
    },

    template:_.templateUrl("/service/tpls/mem/service.memCtrl.blendList.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Service.memCtrlBlend.collection,"add",this.addOne);
       this.listenTo(App.Service.memCtrlBlend.collection,"reset",this.render);
        //$el为包含模板的元素，el为元素节点
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Service.MemCtrlBlendDetail({model:model});
        this.$("#blendList").append(newView.render().el);
    },

    //选中事件
    selectAll:function(){
        var $this = this;
        var preS= this.$(".head input")[0].checked;
        this.$(":checkbox").each(function(){
            this.checked = preS;
            if(preS){
                $this.$("li").addClass("active");
                App.Service.memCtrlBlend.collection.each(function(item){item.set({"checked":true})})
            }else{
                $this.$("li").removeClass("active");
                App.Service.memCtrlBlend.collection.each(function(item){item.set({"checked":false})})
            }
        })
    },

    batchAward:function(){
        $("#mask").empty();
        App.Service.window.init();
        $(".serviceWindow").append(new App.Service.windowMem().render().el);//外框
        $(".serviceWindow h1").html("角色授权");


        //以下太乱了，要整理
        //将所选项加入列表
        //获取所选项
        var seleUser = App.Service.memCtrlBlend.collection.filter(function(item){
            if(item.get("checked")){
                return item.get("checked");
            }
        });

        if(!seleUser.length){alert("您没有选择任何成员或组织，无法设置角色！");return}

        //写入已选用户和组织
        $(".memRoleList").append(new App.Service.windowRoleList().render().el);

        //将每项插入到角色列表中
        _.each(seleUser,function(item){
            $(".serviceWindow .aim ul").append( new App.Service.window.BlendDetail({model:item}).render().el);
        });

        var data = {

        };


        App.Service.ozRole.loadData(data,function(){
            //获取父项id的model，这个model在左侧点击时获取数据，目前左侧不点击，无法获取数据，待解决，或许自定义事件触发解决


            //无需选择了,多选选父项
            /*App.Service.role.collection.each(function(item){
                item.unset("checked");//清除痕迹
                for(var i = 0 ; i < roleList.length ; i++){
                    if(item.get("roleId") == roleList[i]["roleId"]){
                        item.set({"checked":true});
                    }
                }
            });*/
            //

            $("#mask").show();
        });

    },

    //获取当前是否有所选项，此处取消，此处由模型触发
    getSelected:function(){
        var arr =[];
        //批量处理,查找已选元素
        this.$(":checkbox").each(function(){
            if($(this).is("checked")){
                //发送请求获取列表？还是存储在直接存储在列表data
            }
        });
    },


    //排序
    comparator:function(){

    }


});




