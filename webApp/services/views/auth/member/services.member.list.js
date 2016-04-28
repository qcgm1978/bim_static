/*
 * @require  /services/views/auth/member/services.member.detail.js
 */

App.Services.MemberList=Backbone.View.extend({

    tagName:"div",

    events:{
        "click .batchAward":"batchAward",//批量授权
        "click .selectAll":"selectAll"//全选
    },

    template:_.templateUrl("/services/tpls/auth/member/services.member.list.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Services.Member[App.Services.MemberType + "Collection"],"add",this.addOne);
       this.listenTo(App.Services.Member[App.Services.MemberType + "Collection"],"reset",this.render);
        //$el为包含模板的元素，el为元素节点
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Services.memberDetail({model:model});
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
                App.Services.Member.innerCollection.each(function(item){item.set({"checked":true})})
            }else{
                $this.$("li").removeClass("active");
                App.Services.Member.innerCollection.each(function(item){item.set({"checked":false})})
            }
        })
    },

    batchAward:function(){
        $("#mask").empty();
        App.Services.window.init();
        $(".serviceWindow").append(new App.Services.windowMem().render().el);//外框
        $(".serviceWindow h1").html("角色授权");


        //获取所选项
        var seleUser = App.Services.Member.innerCollection.filter(function(item){
            if(item.get("checked")){
                return item.get("checked");
            }
        });

        if(!seleUser.length){alert("您没有选择任何成员或组织，无法设置角色！");return}

        //写入已选用户和组织
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);

        //将每项插入到角色列表中
        _.each(seleUser,function(item){
            $(".serviceWindow .aim ul").append( new App.Services.window.BlendDetail({model:item}).render().el);
        });

        var data = {

        };


        App.Services.ozRole.loadData(data,function(){

            $("#mask").show();
        });

    },


    //排序
    comparator:function(){

    }


});




