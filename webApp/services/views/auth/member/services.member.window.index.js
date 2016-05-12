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

        App.Services.Member.saveMemData(submitData);

        data = {
            URLtype:"saveServicesRole",
            data : JSON.stringify(submitData),
            type:"POST",
            contentType: "application/json"
        };

        App.Comm.ajax(data,function(response){
            var type = App.Services.MemberType || "inner";
            if(response.message == "success"){
                var collection = App.Services.Member[type + "Collection"],proto = [];
                _.each(selectRole,function(item){
                    item.set("functions",null);
                    item.unset("checked");
                    proto.push(item.toJSON());
                });

                collection.each(function(item){
                    var l1 = submitData[type]["orgId"];
                    var l2 = submitData[type]["userId"];
                    var orgId = item.get("orgId");
                    var userId = item.get("userId");
                    if(l1.length && orgId){
                        for(var i  = 0 ;  i< l1.length ; i ++){
                            if(orgId == l1[i]){
                                item.set({"role":proto});//如何放在内部
                                return
                            }
                        }
                    }
                    if(l2.length && userId){
                        for(var j = 0 ; j < l2.length ;j++){
                            if(userId == l2[j] ){
                                item.set({"role":proto});
                                return
                            }
                        }
                    }
                });
            }
            App.Services.Member.resetMemData();
            App.Services.maskWindow.close();
        });

        App.Services.Member.resetMemData();
    },

    initialize:function(){
    }
});
