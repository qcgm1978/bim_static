/*
 * @require  /services/views/auth/index.nav.es6
 * */
App.Services.MemberWindowIndex = Backbone.View.extend({

    tagName:"div",

    className:"seWinBody",

    template:_.templateUrl("/services/tpls/auth/windows/services.member.window.index.html"),

    events:{
        "click .windowSubmit":"windowSubmit"
    },


    render:function(){
        this.$el.html(this.template);
        return this;
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    windowSubmit:function(){
        //获取要提交的成员/组织相关信息
        var submitData  = App.Services.memberWindowData;
        if(submitData){
            //获取已选角色,并添加角色ID
            var selectRole = App.Services.role.collection.filter(function(item){
                return item.get("checked");
            });

            if(!selectRole.length){alert("请至少选择一个角色");return;}
            _.each(selectRole,function(item){
                submitData.roleId.push(item.get("roleId"));
            });
        }

        //添加角色列表并提交数据
        var subCollection = App.Services.Member.SubRole;
        subCollection.add(submitData);
        subCollection.sync("POST",{
            success:function(collection,response,options){
                console.log(1);
            }
        });//保存

        //刷新选项的角色列表

        //提交提示，需要回调函数
        //进度窗口
        //提交成功关闭窗口，否则显示提交失败
        App.Services.maskWindow.close();
    },

    initialize:function(){
    }
});
