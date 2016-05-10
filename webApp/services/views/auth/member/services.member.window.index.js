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
        var submitData  = App.Services.memberWindowData;//获取要提交的成员/组织相关信息
        var data;//实际的提交信息
        if(submitData){
            //获取已选角色,并添加角色ID
            var selectRole = App.Services.Member.SubRoleCollection.filter(function(item){
                return item.get("checked");
            });

           // if(!selectRole.length){alert("请至少选择一个角色");return;}
            _.each(selectRole,function(item){
                submitData.roleId.push(item.get("roleId"));
            });
        }


        data = {
            URLtype:"putServicesSaveRole",
            data:JSON.stringify(submitData),
            type:"POST",
            contentType: "application/json"
        };



        App.Comm.ajax(data,function(response){
            if(response.message == "success"){
                var s = App.Services.Member[App.Services.MemberType + "Collection"],proto = [];
                _.each(selectRole,function(item){
                    item.set("functions",null);
                    item.unset("checked");
                    proto.push(item.toJSON());
                });

                s.each(function(item){
                   item.set({"role":proto});//如何放在内部
                    console.log(item);
                });
            }
            //提交成功关闭窗口，否则显示提交失败
            App.Services.maskWindow.close();
        });

    },

    initialize:function(){
    }
});
